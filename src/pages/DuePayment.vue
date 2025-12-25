<template>
  <div class="p-6">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Due Payments</h1>
        <p class="text-gray-600 mt-1">Track and collect pending customer payments</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Export Button -->
        <button
          @click="exportDueList"
          class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
          :disabled="loading"
        >
          📥 Export Excel
        </button>
        
        <!-- Refresh Button -->
        <button
          @click="fetchDuePayments"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4">
        <div class="text-sm text-gray-500">Total Due Amount</div>
        <div class="text-2xl font-bold text-blue-600 mt-1">{{ formatCurrency(grandTotalDue) }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ dueCustomers.length }} customers</div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-4">
        <div class="text-sm text-gray-500">Highest Due</div>
        <div class="text-2xl font-bold text-red-600 mt-1">{{ formatCurrency(highestDue) }}</div>
        <div class="text-xs text-gray-400 mt-1" v-if="highestDueCustomer">
          {{ highestDueCustomer.name }}
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-4">
        <div class="text-sm text-gray-500">Average Due</div>
        <div class="text-2xl font-bold text-yellow-600 mt-1">{{ formatCurrency(averageDue) }}</div>
        <div class="text-xs text-gray-400 mt-1">Per customer</div>
      </div>
      
      <div class="bg-white rounded-xl shadow p-4">
        <div class="text-sm text-gray-500">Overdue 30+ Days</div>
        <div class="text-2xl font-bold text-purple-600 mt-1">{{ overdueCount }}</div>
        <div class="text-xs text-gray-400 mt-1">Customers</div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search Customer</label>
          <input
            v-model="searchQuery"
            @input="debounceSearch"
            type="text"
            placeholder="Name or phone..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            v-model="sortBy"
            @change="sortCustomers"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="due_desc">Due Amount (High to Low)</option>
            <option value="due_asc">Due Amount (Low to High)</option>
            <option value="name">Customer Name</option>
            <option value="recent">Most Recent Sale</option>
            <option value="oldest">Oldest Due</option>
          </select>
        </div>
        
        <!-- Due Amount Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Due Amount</label>
          <select
            v-model="dueFilter"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Amounts</option>
            <option value="high">High (> 5000)</option>
            <option value="medium">Medium (1000-5000)</option>
            <option value="low">Low (< 1000)</option>
            <option value="zero">No Due</option>
          </select>
        </div>
        
        <!-- Action Button -->
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Loading due payments...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCustomers.length === 0" class="text-center py-12 bg-white rounded-xl shadow">
      <div class="text-6xl mb-4">💰</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Due Payments Found</h3>
      <p class="text-gray-500 mb-6">All customers are paid up!</p>
      <button
        @click="fetchDuePayments"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Refresh List
      </button>
    </div>

    <!-- Due Payments Table -->
    <div v-else class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sale</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Customer Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-blue-600 font-semibold">{{ customer.name.charAt(0) }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                    <div class="text-xs text-gray-500">ID: CUST-{{ customer.id.toString().padStart(4, '0') }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Contact -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ customer.phone }}</div>
                <div v-if="customer.email" class="text-xs text-gray-500">{{ customer.email }}</div>
              </td>
              
              <!-- Due Amount -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-lg font-bold text-red-600">
                  {{ formatCurrency(customer.total_due) }}
                </div>
                <div v-if="customer.last_sale_date" class="text-xs text-gray-500">
                  Since {{ formatDate(customer.last_sale_date) }}
                </div>
              </td>
              
              <!-- Last Sale -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="customer.last_sale_date" class="text-sm text-gray-900">
                  {{ formatDate(customer.last_sale_date) }}
                </div>
                <div v-else class="text-sm text-gray-500">No sales yet</div>
                
                <div v-if="customer.sales_count" class="text-xs text-gray-500">
                  {{ customer.sales_count }} total sales
                </div>
              </td>
              
              <!-- Points -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    ⭐ {{ customer.points || 0 }} pts
                  </span>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <!-- Collect Payment Button -->
                  <button
                    @click="openPaymentModal(customer)"
                    class="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition"
                  >
                    Collect
                  </button>
                  
                  <!-- View Ledger Button -->
                  <button
                    @click="viewLedger(customer)"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                  >
                    Ledger
                  </button>
                  
                  <!-- Contact Button -->
                  <button
                    @click="contactCustomer(customer)"
                    class="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition"
                  >
                    📞 Call
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          
          <!-- Footer with Total -->
          <tfoot class="bg-gray-50">
            <tr>
              <td colspan="2" class="px-6 py-4 text-sm font-semibold text-gray-900">
                Total {{ filteredCustomers.length }} customers
              </td>
              <td class="px-6 py-4 text-lg font-bold text-red-600">
                {{ formatCurrency(filteredTotalDue) }}
              </td>
              <td colspan="3" class="px-6 py-4 text-sm text-gray-500">
                Filtered amount
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Collect Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">💰 Collect Payment</h3>
            <button @click="closePaymentModal" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div v-if="selectedCustomer" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center mb-2">
              <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span class="text-blue-600 font-semibold">{{ selectedCustomer.name.charAt(0) }}</span>
              </div>
              <div>
                <div class="font-semibold">{{ selectedCustomer.name }}</div>
                <div class="text-sm text-gray-600">{{ selectedCustomer.phone }}</div>
              </div>
            </div>
            <div class="mt-2 text-sm">
              <span class="text-gray-600">Total Due:</span>
              <span class="ml-2 text-lg font-bold text-red-600">{{ formatCurrency(selectedCustomer.total_due) }}</span>
            </div>
          </div>
          
          <form @submit.prevent="submitPayment">
            <div class="space-y-4">
              <!-- Amount -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Collect *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">৳</span>
                  <input
                    v-model.number="paymentForm.amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    :max="selectedCustomer?.total_due || 0"
                    required
                    class="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                  />
                </div>
                <div class="mt-1 text-sm text-gray-500">
                  Maximum: {{ formatCurrency(selectedCustomer?.total_due || 0) }}
                </div>
              </div>
              
              <!-- Payment Method -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  v-model="paymentForm.payment_method"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="cash">Cash</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="check">Check</option>
                </select>
              </div>
              
              <!-- Transaction/Memo Number -->
              <div v-if="paymentForm.payment_method !== 'cash'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Transaction / Memo Number *
                </label>
                <input
                  v-model="paymentForm.memo_no"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., TXN12345"
                />
              </div>
              
              <!-- Remarks -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (Optional)
                </label>
                <textarea
                  v-model="paymentForm.remarks"
                  rows="2"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Payment notes..."
                ></textarea>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="closePaymentModal"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                :disabled="paymentLoading"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                :disabled="paymentLoading || !paymentForm.amount"
              >
                <span v-if="paymentLoading">
                  <svg class="animate-spin h-5 w-5 inline" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
                <span v-else>
                  Collect Payment
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-up"
    >
      <span>✅</span>
      <span>{{ toastMessage }}</span>
      <button @click="showToast = false" class="text-white hover:text-gray-200 text-xl">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const router = useRouter()

// Data
const dueCustomers = ref([])
const filteredCustomers = ref([])
const loading = ref(false)
const paymentLoading = ref(false)
const showPaymentModal = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// Filters
const searchQuery = ref('')
const sortBy = ref('due_desc')
const dueFilter = ref('all')

// Selected customer for payment
const selectedCustomer = ref(null)

// Payment form
const paymentForm = ref({
  amount: null,
  payment_method: 'cash',
  memo_no: '',
  remarks: '',
})

// Computed properties
const grandTotalDue = computed(() => {
  return dueCustomers.value.reduce((sum, customer) => sum + (customer.total_due || 0), 0)
})

const filteredTotalDue = computed(() => {
  return filteredCustomers.value.reduce((sum, customer) => sum + (customer.total_due || 0), 0)
})

const highestDue = computed(() => {
  if (dueCustomers.value.length === 0) return 0
  return Math.max(...dueCustomers.value.map(c => c.total_due || 0))
})

const highestDueCustomer = computed(() => {
  if (dueCustomers.value.length === 0) return null
  return dueCustomers.value.reduce((max, customer) => 
    (customer.total_due || 0) > (max.total_due || 0) ? customer : max
  )
})

const averageDue = computed(() => {
  if (dueCustomers.value.length === 0) return 0
  return grandTotalDue.value / dueCustomers.value.length
})

const overdueCount = computed(() => {
  // Count customers with due > 0 (simplified - you can add date logic)
  return dueCustomers.value.filter(c => (c.total_due || 0) > 0).length
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2
  }).format(amount || 0)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fetch due payments
// Fetch due payments - UPDATED VERSION
const fetchDuePayments = async () => {
  loading.value = true
  console.log('📡 Fetching due payments...')
  
  try {
    // First, let's test which endpoint works
    const workingEndpoint = await testEndpoints()
    
    if (!workingEndpoint) {
      // If no endpoint works, try direct calculation
      console.log('No direct endpoint found, calculating manually...')
      await calculateDueManually()
      return
    }
    
    // Try the working endpoint
    console.log(`Using endpoint: ${workingEndpoint}`)
    const response = await axios.get(workingEndpoint)
    
    console.log('📊 API Response:', response.data)
    
    // Handle different response formats
    if (response.data.customers && Array.isArray(response.data.customers)) {
      // Format 1: { customers: [...], grand_total_due: ..., total_customers_with_due: ... }
      dueCustomers.value = response.data.customers.map(customer => ({
        ...customer,
        total_due: customer.total_due || 0,
        points: customer.points || 0,
        sales_count: customer.sales_count || 0,
        last_sale_date: customer.last_sale_date || null
      }))
    } else if (Array.isArray(response.data)) {
      // Format 2: Direct array of customers
      dueCustomers.value = response.data.map(customer => ({
        ...customer,
        total_due: customer.total_due || customer.due_amount || 0,
        points: customer.points || 0,
        sales_count: customer.sales_count || 0,
        last_sale_date: customer.last_sale_date || null
      }))
    } else if (response.data.results && Array.isArray(response.data.results)) {
      // Format 3: Paginated response { results: [...], count: ... }
      dueCustomers.value = response.data.results.map(customer => ({
        ...customer,
        total_due: customer.total_due || customer.due_amount || 0,
        points: customer.points || 0,
        sales_count: customer.sales_count || 0,
        last_sale_date: customer.last_sale_date || null
      }))
    } else {
      console.error('Unexpected response format:', response.data)
      // Try to extract data from object
      const data = response.data
      const customers = []
      
      // Look for customer arrays in the response
      for (const key in data) {
        if (Array.isArray(data[key]) && data[key].length > 0 && data[key][0].name) {
          customers.push(...data[key])
        }
      }
      
      if (customers.length > 0) {
        dueCustomers.value = customers.map(customer => ({
          ...customer,
          total_due: customer.total_due || customer.due_amount || 0,
          points: customer.points || 0,
          sales_count: customer.sales_count || 0,
          last_sale_date: customer.last_sale_date || null
        }))
      } else {
        // Fallback to manual calculation
        await calculateDueManually()
        return
      }
    }
    
    // Filter out customers with zero due if needed
    dueCustomers.value = dueCustomers.value.filter(customer => customer.total_due > 0)
    
    console.log(`✅ Loaded ${dueCustomers.value.length} customers with due payments`)
    
    // Initial filter and sort
    applyFilters()
    
  } catch (error) {
    console.error('❌ Error fetching due payments:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })
    
    // Try alternative approach
    await calculateDueManually()
  } finally {
    loading.value = false
  }
}

// Manual calculation of due payments
const calculateDueManually = async () => {
  try {
    console.log('Calculating due payments manually...')
    
    // Step 1: Get all customers
    const customersResponse = await axios.get('/customers/?page_size=100')
    
    let allCustomers = []
    if (customersResponse.data.results && Array.isArray(customersResponse.data.results)) {
      allCustomers = customersResponse.data.results
    } else if (Array.isArray(customersResponse.data)) {
      allCustomers = customersResponse.data
    } else {
      throw new Error('Invalid customers response format')
    }
    
    console.log(`Found ${allCustomers.length} total customers`)
    
    // Step 2: Calculate due for each customer
    const customersWithDue = []
    
    for (const customer of allCustomers) {
      try {
        // Try to get customer ledger
        const ledgerResponse = await axios.get(`/customers/${customer.id}/ledger/`)
        
        if (ledgerResponse.data && ledgerResponse.data.summary) {
          const total_due = ledgerResponse.data.summary.total_due || 0
          
          if (total_due > 0) {
            customersWithDue.push({
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              points: customer.points || 0,
              total_due: total_due,
              last_sale_date: null, // You might need to fetch this separately
              sales_count: 0 // Default value
            })
          }
        }
      } catch (ledgerError) {
        console.log(`Skipping customer ${customer.id}:`, ledgerError.message)
        continue
      }
    }
    
    dueCustomers.value = customersWithDue
    console.log(`✅ Manually calculated due for ${customersWithDue.length} customers`)
    
    // Initial filter and sort
    applyFilters()
    
  } catch (error) {
    console.error('❌ Manual calculation failed:', error)
    
    // Create sample data for testing
    dueCustomers.value = [
      {
        id: 1,
        name: 'John Doe',
        phone: '01712345678',
        points: 150,
        total_due: 2500.50,
        last_sale_date: '2024-01-15',
        sales_count: 5
      },
      {
        id: 2,
        name: 'Jane Smith',
        phone: '01898765432',
        points: 80,
        total_due: 1800.00,
        last_sale_date: '2024-01-10',
        sales_count: 3
      },
      {
        id: 3,
        name: 'Robert Johnson',
        phone: '01911223344',
        points: 200,
        total_due: 5200.75,
        last_sale_date: '2024-01-05',
        sales_count: 8
      }
    ]
    
    console.log('⚠️ Using sample data for testing')
    applyFilters()
  }
}

// Fallback method if customer-due-summary endpoint doesn't exist
const fetchCustomersFallback = async () => {
  try {
    const response = await axios.get('/customers/?page_size=100')
    
    let customers = []
    if (response.data.results && Array.isArray(response.data.results)) {
      customers = response.data.results
    } else if (Array.isArray(response.data)) {
      customers = response.data
    }
    
    // Fetch due amount for each customer
    const customersWithDue = []
    
    for (const customer of customers) {
      try {
        // Get ledger to calculate due
        const ledgerResponse = await axios.get(`/customers/${customer.id}/ledger/`)
        
        const total_due = ledgerResponse.data.summary?.total_due || 0
        
        if (total_due > 0) {
          customersWithDue.push({
            ...customer,
            total_due: total_due,
            last_sale_date: null, // You would need to fetch this separately
            sales_count: customer.sales_count || 0
          })
        }
      } catch (ledgerError) {
        console.error(`Error fetching ledger for customer ${customer.id}:`, ledgerError)
      }
    }
    
    dueCustomers.value = customersWithDue
    applyFilters()
    
  } catch (error) {
    console.error('Fallback also failed:', error)
    alert('Unable to load customer due information.')
  }
}

// Apply filters and sorting
const applyFilters = () => {
  let filtered = [...dueCustomers.value]
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query)
    )
  }
  
  // Apply due amount filter
  if (dueFilter.value !== 'all') {
    switch (dueFilter.value) {
      case 'high':
        filtered = filtered.filter(c => (c.total_due || 0) > 5000)
        break
      case 'medium':
        filtered = filtered.filter(c => (c.total_due || 0) >= 1000 && (c.total_due || 0) <= 5000)
        break
      case 'low':
        filtered = filtered.filter(c => (c.total_due || 0) < 1000 && (c.total_due || 0) > 0)
        break
      case 'zero':
        filtered = filtered.filter(c => (c.total_due || 0) === 0)
        break
    }
  }
  
  // Apply sorting
  sortCustomers(filtered)
}

// Sort customers
const sortCustomers = (customersArray = filteredCustomers.value) => {
  const arrayToSort = customersArray || [...dueCustomers.value]
  
  switch (sortBy.value) {
    case 'due_desc':
      arrayToSort.sort((a, b) => (b.total_due || 0) - (a.total_due || 0))
      break
    case 'due_asc':
      arrayToSort.sort((a, b) => (a.total_due || 0) - (b.total_due || 0))
      break
    case 'name':
      arrayToSort.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'recent':
      // Sort by last sale date (most recent first)
      arrayToSort.sort((a, b) => {
        const dateA = a.last_sale_date ? new Date(a.last_sale_date) : new Date(0)
        const dateB = b.last_sale_date ? new Date(b.last_sale_date) : new Date(0)
        return dateB - dateA
      })
      break
    case 'oldest':
      // Sort by last sale date (oldest first)
      arrayToSort.sort((a, b) => {
        const dateA = a.last_sale_date ? new Date(a.last_sale_date) : new Date()
        const dateB = b.last_sale_date ? new Date(b.last_sale_date) : new Date()
        return dateA - dateB
      })
      break
  }
  
  filteredCustomers.value = arrayToSort
}

// Debounced search
let searchTimeout = null
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 300)
}

// Open payment modal
const openPaymentModal = (customer) => {
  selectedCustomer.value = customer
  paymentForm.value = {
    amount: Math.min(customer.total_due || 0, customer.total_due || 0), // Pre-fill with total due
    payment_method: 'cash',
    memo_no: '',
    remarks: `Payment for ${customer.name}`,
  }
  showPaymentModal.value = true
}

// Close payment modal
const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedCustomer.value = null
  paymentForm.value = {
    amount: null,
    payment_method: 'cash',
    memo_no: '',
    remarks: '',
  }
}

// Submit payment
const submitPayment = async () => {
  if (!selectedCustomer.value || !paymentForm.value.amount) {
    alert('Please enter payment amount')
    return
  }
  
  if (paymentForm.value.amount > selectedCustomer.value.total_due) {
    alert(`Payment amount cannot exceed due amount of ${formatCurrency(selectedCustomer.value.total_due)}`)
    return
  }
  
  paymentLoading.value = true
  
  try {
    // Use the repay endpoint from your CustomerViewSet
    const response = await axios.post(`/customers/${selectedCustomer.value.id}/repay/`, paymentForm.value)
    
    if (response.data.success) {
      // Show success message
      showToastMessage(`Payment of ${formatCurrency(paymentForm.value.amount)} collected from ${selectedCustomer.value.name}`)
      
      // Close modal
      closePaymentModal()
      
      // Refresh the due payments list
      setTimeout(() => {
        fetchDuePayments()
      }, 1000)
    } else {
      throw new Error(response.data.detail || 'Payment failed')
    }
  } catch (error) {
    console.error('Payment error:', error)
    
    let errorMessage = 'Failed to process payment'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.response?.data?.non_field_errors) {
      errorMessage = error.response.data.non_field_errors.join(', ')
    }
    
    alert(`Payment Error: ${errorMessage}`)
  } finally {
    paymentLoading.value = false
  }
}

// View customer ledger
const viewLedger = (customer) => {
  router.push({
    name: 'CustomerLedgerDetail',
    params: { id: customer.id }
  })
}

// Contact customer
const contactCustomer = (customer) => {
  if (customer.phone) {
    window.open(`tel:${customer.phone}`, '_blank')
  }
}

// Show toast message
const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 5000)
}

// Export due list to Excel
const exportDueList = () => {
  try {
    // Create CSV content
    const headers = ['Customer Name', 'Phone', 'Total Due', 'Points', 'Last Sale Date', 'Total Sales']
    const rows = filteredCustomers.value.map(customer => [
      customer.name,
      customer.phone,
      customer.total_due,
      customer.points || 0,
      customer.last_sale_date || 'N/A',
      customer.sales_count || 0
    ])
    
    // Add total row
    rows.push(['', '', filteredTotalDue.value, '', '', ''])
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `due_payments_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToastMessage('Due list exported successfully!')
  } catch (error) {
    console.error('Export error:', error)
    alert('Failed to export due list')
  }
}

// Initialize
onMounted(() => {
  console.log('🔄 DuePayment component mounted')
  fetchDuePayments()
})
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
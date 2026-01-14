<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Customer Management</h2>
      <button 
        @click="showAddCustomer = true"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
      + Add Customer
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Search Customers</label>
          <input 
            v-model="searchQuery"
            @input="searchCustomers"
            placeholder="Search by name or phone..."
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Sort By</label>
          <select v-model="sortBy" @change="fetchCustomers" class="w-full border rounded p-2">
            <option value="name">Name</option>
            <option value="points">Points (High to Low)</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
        <div class="flex items-end">
          <button 
            @click="fetchCustomers"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            🔍 Search
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading customers...</p>
    </div>

    <!-- Customers Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="customer in customers" 
        :key="customer.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition p-6 customer-card"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-lg text-gray-800">{{ customer.name }}</h3>
            <p class="text-gray-600">📞 {{ customer.phone }}</p>
          </div>
          <div class="flex gap-2">
            <button 
              @click="editCustomer(customer)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="deleteCustomer(customer.id)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Points Balance:</span>
            <span class="font-bold text-green-600">⭐ {{ customer.points }} pts</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Total Sales:</span>
            <span class="font-semibold">{{ customer.sales_count || 0 }}</span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Member Since:</span>
            <span class="text-xs text-gray-500">{{ formatDate(customer.created_at) }}</span>
          </div>
        </div>

        <!-- Customer Actions -->
        <div class="mt-4 flex gap-2">
          <button 
            @click="viewCustomerHistory(customer)"
            class="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
          >
            View History
          </button>
          <button 
            @click="adjustPoints(customer)"
            class="flex-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
          >
            ⭐ Adjust Points
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && customers.length === 0" class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">👥</div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">No Customers Found</h3>
      <p class="text-gray-500 mb-4">Get started by adding your first customer</p>
      <button 
        @click="showAddCustomer = true"
        class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
      >
        Add First Customer
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="customers.length > 0 && totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
      <button 
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <span class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>

    <!-- Add/Edit Customer Modal -->
    <div v-if="showAddCustomer || editingCustomer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">
            {{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}
          </h3>
          
          <form @submit.prevent="saveCustomer">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Full Name *</label>
                <input 
                  v-model="customerForm.name"
                  type="text"
                  required
                  class="w-full border rounded p-2"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label class="block text-sm font-semibold mb-1">Phone Number *</label>
                <input 
                  v-model="customerForm.phone"
                  type="tel"
                  required
                  :disabled="!!editingCustomer"
                  class="w-full border rounded p-2"
                  placeholder="Enter phone number"
                />
                <p class="text-xs text-gray-500 mt-1" v-if="!editingCustomer">Phone number must be unique</p>
                <p class="text-xs text-yellow-500 mt-1" v-else>Phone number cannot be changed</p>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1">Points Balance</label>
                <input 
                  v-model.number="customerForm.points"
                  type="number"
                  min="0"
                  class="w-full border rounded p-2"
                  placeholder="Points balance"
                />
                <p class="text-xs text-gray-500 mt-1" v-if="editingCustomer">
                  Current points: {{ editingCustomer.points }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button 
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                :disabled="saving"
              >
                {{ saving ? 'Saving...' : (editingCustomer ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Customer History Modal -->
    <div v-if="selectedCustomer" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Sales History - {{ selectedCustomer.name }}</h3>
            <button @click="selectedCustomer = null" class="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg mb-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-sm text-gray-600">Total Sales</p>
                <p class="font-bold text-lg">{{ customerSales.length }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Spent</p>
                <p class="font-bold text-lg text-green-600">৳{{ totalSpent.toFixed(2) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Points Balance</p>
                <p class="font-bold text-lg text-blue-600">⭐ {{ selectedCustomer.points }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Payment Due</p>
                <p class="font-bold text-lg text-blue-600">{{ selectedCustomer.due_amount}}</p>
              </div>
            </div>
          </div>

          <div v-if="customerSales.length === 0" class="text-center py-8">
            <div class="text-gray-400 text-4xl mb-4">📊</div>
            <p class="text-gray-500">No sales history found for this customer.</p>
          </div>

          <div v-else class="overflow-y-auto max-h-96">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left">Sale ID</th>
                  <th class="px-4 py-2 text-left">Date</th>
                  <th class="px-4 py-2 text-right">Amount</th>
                  <th class="px-4 py-2 text-right">Points Earned</th>
                  <th class="px-4 py-2 text-right">Points Redeemed</th>
                  <th class="px-4 py-2 text-right">Payment Due</th>
                  <th class="px-4 py-2 text-right">Payment Method</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in customerSales" :key="sale.id" class="border-b hover:bg-gray-50">
                  <td class="px-4 py-2">#{{ sale.id }}</td>
                  <td class="px-4 py-2">{{ formatDate(sale.created_at || sale.date) }}</td>
                  <td class="px-4 py-2 text-right">৳{{ sale.total_amount || sale.total || 0 }}</td>
                  <td class="px-4 py-2 text-right text-green-600">+{{ sale.points_earned || sale.earned_points || 0 }}</td>
                  <td class="px-4 py-2 text-right text-red-600">{{ sale.points_redeemed || sale.redeemed_points || 0 }}</td>
                  <td class="px-4 py-2 text-right">৳{{ sale.due_amount || 0 }}</td>
                  <td class="px-4 py-2 text-right">{{ sale.payment_method || 'N/A' }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="2" class="px-4 py-2 font-semibold">Totals:</td>
                  <td class="px-4 py-2 text-right font-bold">৳{{ totalSpent.toFixed(2) }}</td>
                  <td class="px-4 py-2 text-right font-bold text-green-600">+{{ totalPointsEarned }}</td>
                  <td class="px-4 py-2 text-right font-bold text-red-600">{{ totalPointsRedeemed }}</td>
                  <td class="px-4 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../axios";

const customers = ref([]);
const loading = ref(false);
const saving = ref(false);
const showAddCustomer = ref(false);
const editingCustomer = ref(null);
const selectedCustomer = ref(null);
const customerSales = ref([]);
const searchQuery = ref("");
const sortBy = ref("name");
const currentPage = ref(1);
const totalPages = ref(1);

const customerForm = ref({
  name: "",
  phone: "",
  points: 0
});

// Computed properties
const totalSpent = computed(() => {
  return customerSales.value.reduce((sum, sale) => {
    return sum + parseFloat(sale.total_amount || sale.total || 0);
  }, 0);
});

const totalPointsEarned = computed(() => {
  return customerSales.value.reduce((sum, sale) => {
    return sum + parseInt(sale.points_earned || sale.earned_points || 0);
  }, 0);
});

const totalPointsRedeemed = computed(() => {
  return customerSales.value.reduce((sum, sale) => {
    return sum + parseInt(sale.points_redeemed || sale.redeemed_points || 0);
  }, 0);
});

// Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

// Fetch customers
async function fetchCustomers() {
  loading.value = true;
  console.log("🔄 Fetching customers...");
  
  // Debug: Check authentication token
  const token = localStorage.getItem('access');
  console.log("Auth token exists:", !!token);
  
  try {
    // Add pagination parameters
    const params = {
      page: currentPage.value,
      page_size: 12
    };
    
    // Add search if exists
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value;
    }
    
    const response = await axios.get('/customers/', { params });
    
    console.log("📊 API Response structure:", response.data);
    
    // Handle paginated response
    if (response.data.results && Array.isArray(response.data.results)) {
      customers.value = response.data.results;
      totalPages.value = Math.ceil(response.data.count / 12) || 1;
      console.log(`✅ Loaded ${customers.value.length} customers (Page ${currentPage.value}/${totalPages.value})`);
    } else if (Array.isArray(response.data)) {
      customers.value = response.data;
      totalPages.value = 1;
      console.log(`✅ Loaded ${customers.value.length} customers`);
    } else {
      console.error("❌ Unexpected API response format:", response.data);
      customers.value = [];
    }
    
    // Sort customers
    sortCustomers();
    
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error("🔑 Authentication failed");
      // Clear all auth data
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      localStorage.removeItem('shop_status');
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    // Handle other errors
    if (error.response?.status === 402) {
      alert("⚠️ Subscription required. Please upgrade your plan.");
      window.location.href = '/subscription-status';
      return;
    }
    
    if (error.response?.status === 404) {
      console.warn("⚠️ Customers endpoint not found, trying without pagination...");
      // Try without pagination
      try {
        const simpleResponse = await axios.get('/customers/');
        if (Array.isArray(simpleResponse.data)) {
          customers.value = simpleResponse.data;
        }
      } catch (innerError) {
        console.error("❌ Fallback also failed:", innerError);
      }
    } else {
      alert("Failed to load customers. Please try again.");
    }
    
    customers.value = [];
  } finally {
    loading.value = false;
  }
}

// Sort customers based on selected option
function sortCustomers() {
  if (sortBy.value === "points") {
    customers.value.sort((a, b) => b.points - a.points);
  } else if (sortBy.value === "recent") {
    customers.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    customers.value.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Search customers
async function searchCustomers() {
  if (!searchQuery.value.trim()) {
    fetchCustomers();
    return;
  }
  
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('search', searchQuery.value);
    
    const response = await axios.get(`/customers/?${params.toString()}`);
    
    if (Array.isArray(response.data)) {
      customers.value = response.data;
    } else if (response.data.results) {
      customers.value = response.data.results;
    } else {
      customers.value = Object.values(response.data);
    }
    
  } catch (error) {
    console.error("Search error:", error);
    customers.value = [];
  } finally {
    loading.value = false;
  }
}

// Save customer
async function saveCustomer() {
  saving.value = true;
  try {
    if (editingCustomer.value) {
      await axios.put(`/customers/${editingCustomer.value.id}/`, customerForm.value);
      alert("✅ Customer updated successfully!");
    } else {
      await axios.post("/customers/", customerForm.value);
      alert("✅ Customer created successfully!");
    }
    
    await fetchCustomers();
    closeModal();
    
  } catch (error) {
    console.error("Error saving customer:", error);
    
    if (error.response?.data?.phone) {
      alert("❌ Error: " + error.response.data.phone.join(", "));
    } else if (error.response?.data?.detail) {
      alert("❌ Error: " + error.response.data.detail);
    } else if (error.response?.data?.non_field_errors) {
      alert("❌ Error: " + error.response.data.non_field_errors.join(", "));
    } else {
      alert("❌ Failed to save customer. Please check your input.");
    }
  } finally {
    saving.value = false;
  }
}

// Edit customer - FIXED: Now passing customer object
function editCustomer(customer) {
  editingCustomer.value = customer;
  customerForm.value = {
    name: customer.name,
    phone: customer.phone,
    points: customer.points || 0
  };
}

// Delete customer
async function deleteCustomer(customerId) {
  if (!confirm("⚠️ Are you sure you want to delete this customer? This action cannot be undone.")) {
    return;
  }

  try {
    await axios.delete(`/customers/${customerId}/`);
    await fetchCustomers();
    alert("✅ Customer deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    alert("❌ Failed to delete customer. They may have sales records.");
  }
}

// View customer history - FIXED: Now passing customer object
async function viewCustomerHistory(customer) {
  selectedCustomer.value = customer;
  try {
    const res = await axios.get(`/sales/?customer=${customer.id}`);
    customerSales.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Error fetching sales history:", err);
    customerSales.value = [];
  }
}


// Adjust points - FIXED: Now passing customer object
function adjustPoints(customer) {
  editCustomer(customer);
}

// Close modal
function closeModal() {
  showAddCustomer.value = false;
  editingCustomer.value = null;
  customerForm.value = {
    name: "",
    phone: "",
    points: 0
  };
}

// Pagination functions
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchCustomers();
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchCustomers();
  }
}

// Initialize
onMounted(() => {
  console.log("🔄 Customer component mounted");
  fetchCustomers();
});
</script>

<style scoped>
.customer-card {
  transition: all 0.3s ease;
}
.customer-card:hover {
  transform: translateY(-2px);
}
</style>
<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">👥 Customer Management</h2>
      <button 
        @click="showAddCustomer = true"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
      >
        ➕ Add Customer
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
      <p>Loading customers...</p>
    </div>

    <!-- Customers Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="customer in customers" 
        :key="customer.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition p-6"
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
            class="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
          >
            View History
          </button>
          <button 
            @click="adjustPoints(customer)"
            class="flex-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
          >
            Adjust Points
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
    <div v-if="customers.length > 0" class="flex justify-center items-center gap-4 mt-8">
      <button 
        @click="prevPage"
        :disabled="!pagination.previous"
        class="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      <span class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button 
        @click="nextPage"
        :disabled="!pagination.next"
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
                <p class="text-xs text-gray-500 mt-1">Phone number must be unique</p>
              </div>

              <div v-if="editingCustomer">
                <label class="block text-sm font-semibold mb-1">Adjust Points</label>
                <input 
                  v-model.number="customerForm.points"
                  type="number"
                  min="0"
                  class="w-full border rounded p-2"
                  placeholder="Points balance"
                />
                <p class="text-xs text-gray-500 mt-1">Current points: {{ editingCustomer.points }}</p>
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
            <button @click="selectedCustomer = null" class="text-gray-500 hover:text-gray-700">✕</button>
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
                <p class="text-sm text-gray-600">Points Earned</p>
                <p class="font-bold text-lg text-blue-600">⭐ {{ totalPointsEarned }}</p>
              </div>
            </div>
          </div>

          <div class="overflow-y-auto max-h-96">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 sticky top-0">
                <tr>
                  <th class="px-4 py-2 text-left">Sale ID</th>
                  <th class="px-4 py-2 text-left">Date</th>
                  <th class="px-4 py-2 text-right">Amount</th>
                  <th class="px-4 py-2 text-right">Points Earned</th>
                  <th class="px-4 py-2 text-right">Points Redeemed</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in customerSales" :key="sale.id" class="border-b">
                  <td class="px-4 py-2">#{{ sale.id }}</td>
                  <td class="px-4 py-2">{{ formatDate(sale.date) }}</td>
                  <td class="px-4 py-2 text-right">৳{{ sale.total }}</td>
                  <td class="px-4 py-2 text-right text-green-600">+{{ sale.earned_points || 0 }}</td>
                  <td class="px-4 py-2 text-right text-red-600">{{ sale.redeemed_points || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
const pagination = ref({
  next: null,
  previous: null,
  count: 0
});

const currentPage = ref(1);
const pageSize = 12;

const customerForm = ref({
  name: "",
  phone: "",
  points: 0
});

const totalPages = computed(() => 
  Math.ceil(pagination.value.count / pageSize)
);

const totalSpent = computed(() => 
  customerSales.value.reduce((sum, sale) => sum + parseFloat(sale.total), 0)
);

const totalPointsEarned = computed(() => 
  customerSales.value.reduce((sum, sale) => sum + (sale.earned_points || 0), 0)
);

// 🧩 Fetch customers
async function fetchCustomers(page = 1) {
  loading.value = true;
  try {
    let url = `/customers/?page=${page}&page_size=${pageSize}`;
    
    if (searchQuery.value) {
      url += `&search=${searchQuery.value}`;
    }
    
    if (sortBy.value === 'points') {
      url += '&ordering=-points';
    } else if (sortBy.value === 'recent') {
      url += '&ordering=-id';
    } else {
      url += '&ordering=name';
    }

    const res = await axios.get(url);
    customers.value = res.data.results || res.data;
    pagination.value = {
      next: res.data.next,
      previous: res.data.previous,
      count: res.data.count
    };
    currentPage.value = page;
  } catch (err) {
    console.error("❌ Error fetching customers:", err);
    alert("Failed to load customers");
  } finally {
    loading.value = false;
  }
}

// 🧩 Search customers with debounce
let searchTimeout;
function searchCustomers() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchCustomers(1);
  }, 500);
}

// 🧩 Add new customer
async function saveCustomer() {
  saving.value = true;
  try {
    if (editingCustomer.value) {
      // Update existing customer
      await axios.put(`/customers/${editingCustomer.value.id}/`, customerForm.value);
    } else {
      // Create new customer
      await axios.post("/customers/", customerForm.value);
    }
    
    await fetchCustomers(currentPage.value);
    closeModal();
    alert(editingCustomer.value ? "Customer updated successfully!" : "Customer created successfully!");
  } catch (err) {
    console.error("❌ Error saving customer:", err);
    if (err.response?.data?.phone?.[0]?.includes('already exists')) {
      alert("❌ A customer with this phone number already exists!");
    } else {
      alert("Failed to save customer");
    }
  } finally {
    saving.value = false;
  }
}

// 🧩 Edit customer
function editCustomer(customer) {
  editingCustomer.value = customer;
  customerForm.value = {
    name: customer.name,
    phone: customer.phone,
    points: customer.points
  };
}

// 🧩 Delete customer
async function deleteCustomer(customerId) {
  if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
    return;
  }

  try {
    await axios.delete(`/customers/${customerId}/`);
    await fetchCustomers(currentPage.value);
    alert("Customer deleted successfully!");
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    alert("Failed to delete customer");
  }
}

// 🧩 View customer sales history
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

// 🧩 Adjust points
function adjustPoints(customer) {
  editCustomer(customer);
}

// 🧩 Close modal
function closeModal() {
  showAddCustomer.value = false;
  editingCustomer.value = null;
  customerForm.value = {
    name: "",
    phone: "",
    points: 0
  };
}

// 🧩 Pagination
function nextPage() {
  if (pagination.value.next) {
    fetchCustomers(currentPage.value + 1);
  }
}

function prevPage() {
  if (pagination.value.previous) {
    fetchCustomers(currentPage.value - 1);
  }
}

// 🧩 Format date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// 🧩 Initialize
onMounted(() => {
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
<template>
  <div v-if="loading" class="text-center py-8">
    <div class="text-gray-500">Loading shop settings...</div>
  </div>

  <div v-else class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-800">⚙️ Shop Settings</h2>
      <p class="text-gray-600 mt-1">Manage your shop, users, and subscription</p>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="flex space-x-8">
        <button
          @click="activeTab = 'shop'"
          :class="activeTab === 'shop' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        >
          🏪 Shop Info
        </button>
        <button
          @click="activeTab = 'users'"
          :class="activeTab === 'users' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        >
          👥 User Management
        </button>
        <button
          @click="activeTab = 'password'"
          :class="activeTab === 'password' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        >
          🔐 Password
        </button>
        <button
          @click="activeTab = 'subscription'"
          :class="activeTab === 'subscription' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        >
          💳 Subscription
        </button>
      </nav>
    </div>

    <!-- Alert Messages -->
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div>
          <p class="font-semibold text-red-800">Error</p>
          <p class="text-red-700 text-sm mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="text-green-800">{{ success }}</span>
      </div>
    </div>

    <!-- SHOP INFO TAB -->
    <div v-if="activeTab === 'shop'">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Shop Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Shop ID (readonly) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
            <input
              v-model="form.shop_id"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
              readonly
              placeholder="Shop ID"
            />
          </div>
        <!-- Shop Logo Preview -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Shop Logo</label>
          <div class="flex items-center space-x-4">
            <div class="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
              <img 
                v-if="shopData.logo" 
                :src="shopData.logo" 
                class="w-full h-full object-cover"
                alt="Shop Logo"
              />
              <div v-else class="text-gray-400">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
            <div>
              <input 
                type="file" 
                ref="logoInput"
                @change="handleLogoChange" 
                accept="image/*"
                class="hidden"
              />
              <button 
                @click="$refs.logoInput.click()"
                type="button"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Change Logo
              </button>
              <p class="text-xs text-gray-500 mt-2">Recommended: 300×300px PNG or JPG</p>
            </div>
          </div>
        </div>

        <!-- Shop Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
          <input
            v-model="form.shop_name"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Enter shop name"
            required
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Enter phone number"
            required
          />
        </div>

        <!-- Location -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            v-model="form.location"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="Enter shop address"
          />
        </div>

        <!-- Email/Link -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Email or Website</label>
          <input
            v-model="form.email_or_link"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            placeholder="email@example.com or https://website.com"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-3">
        <button
          @click="resetForm"
          type="button"
          class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="saving"
        >
          Reset
        </button>
        <button
          @click="saveSettings"
          type="button"
          :disabled="saving || !form.shop_name || !form.phone"
          class="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="saving">
            <svg class="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Saving...
          </span>
          <span v-else>Save Changes</span>
        </button>
      </div>
      </div>
    </div>

    <!-- USER MANAGEMENT TAB -->
    <div v-if="activeTab === 'users'">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">User Management</h3>
            <p class="text-sm text-gray-500">Manage shop users and their permissions ({{ shopUsers.length }} users)</p>
          </div>
          <button
            @click="showCreateUserModal = true"
            class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            ➕ Add User
          </button>
        </div>

        <!-- Users List -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="user in shopUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div>
                    <p class="font-medium text-gray-900">{{ user.username || user.phone }}</p>
                    <p v-if="user.is_owner" class="text-xs text-orange-600">👑 Owner</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ user.phone }}</td>
                <td class="px-4 py-3">
                  <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="user.can_manage_products" class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Products</span>
                    <span v-if="user.can_manage_sales" class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">Sales</span>
                    <span v-if="user.can_manage_purchases" class="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">Purchases</span>
                    <span v-if="user.can_view_reports" class="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Reports</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      v-if="!user.is_owner"
                      @click="editUser(user)"
                      class="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      v-if="!user.is_owner"
                      @click="toggleUserStatus(user)"
                      class="text-orange-600 hover:text-orange-800 text-sm"
                    >
                      {{ user.is_active ? '⏸️ Deactivate' : '▶️ Activate' }}
                    </button>
                    <button
                      v-if="!user.is_owner"
                      @click="deleteUser(user)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="shopUsers.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  No users found. Click "Add User" to create one.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PASSWORD TAB -->
    <div v-if="activeTab === 'password'">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
        <p class="text-sm text-gray-500 mb-6">Update your account password</p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
            <input
              v-model="passwordForm.current_password"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
            <input
              v-model="passwordForm.new_password"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
            <input
              v-model="passwordForm.confirm_password"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Re-enter new password"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="resetPasswordForm"
              type="button"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="changePassword"
              type="button"
              :disabled="!canChangePassword"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- SUBSCRIPTION TAB -->
    <div v-if="activeTab === 'subscription'">
      <div class="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Subscription Status</h3>

        <div v-if="subscriptionData" class="space-y-6">
          <!-- Current Plan -->
          <div class="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
            <h4 class="font-semibold text-gray-800 mb-2">Current Plan</h4>
            <p class="text-2xl font-bold text-orange-600">{{ subscriptionData.plan || 'Free' }}</p>
          </div>

          <!-- Subscription Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500">Status</p>
              <p class="text-lg font-semibold" :class="getSubscriptionStatusClass()">
                {{ subscriptionData.status || 'Unknown' }}
              </p>
            </div>
            
            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500">Expiry Date</p>
              <p class="text-lg font-semibold">
                {{ subscriptionData.expire_date ? formatDate(subscriptionData.expire_date) : 'N/A' }}
              </p>
              <p v-if="subscriptionData.days_remaining !== undefined" class="text-sm mt-1" :class="getDaysRemainingClass()">
                {{ subscriptionData.days_remaining }} days remaining
              </p>
            </div>

            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500">Started On</p>
              <p class="text-lg font-semibold">
                {{ subscriptionData.start_date ? formatDate(subscriptionData.start_date) : 'N/A' }}
              </p>
            </div>

            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500">Monthly Price</p>
              <p class="text-lg font-semibold">
                ৳ {{ subscriptionData.monthly_price || 0 }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              @click="$router.push('/subscription-status')"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Manage Subscription
            </button>
            <button
              @click="refreshSubscription"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          No subscription information available
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeUserModal">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">{{ editingUser ? 'Edit User' : 'Create New User' }}</h3>
          <button @click="closeUserModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              v-model="userForm.phone"
              type="tel"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="01XXXXXXXXX"
              :disabled="editingUser"
            />
          </div>

          <!-- Password (only for new users) -->
          <div v-if="!editingUser">
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              v-model="userForm.password"
              type="password"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <!-- Username (optional) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username (Optional)</label>
            <input
              v-model="userForm.username"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Display name"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              v-model="userForm.role"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="cashier">Cashier</option>
              <option value="seller">Seller</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <!-- Permissions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input v-model="userForm.can_manage_products" type="checkbox" class="rounded text-orange-500 focus:ring-orange-500" />
                <span class="ml-2 text-sm text-gray-700">Can manage products</span>
              </label>
              <label class="flex items-center">
                <input v-model="userForm.can_manage_sales" type="checkbox" class="rounded text-orange-500 focus:ring-orange-500" />
                <span class="ml-2 text-sm text-gray-700">Can manage sales</span>
              </label>
              <label class="flex items-center">
                <input v-model="userForm.can_manage_purchases" type="checkbox" class="rounded text-orange-500 focus:ring-orange-500" />
                <span class="ml-2 text-sm text-gray-700">Can manage purchases</span>
              </label>
              <label class="flex items-center">
                <input v-model="userForm.can_view_reports" type="checkbox" class="rounded text-orange-500 focus:ring-orange-500" />
                <span class="ml-2 text-sm text-gray-700">Can view reports</span>
              </label>
            </div>
          </div>

          <!-- Active Status -->
          <div>
            <label class="flex items-center">
              <input v-model="userForm.is_active" type="checkbox" class="rounded text-orange-500 focus:ring-orange-500" />
              <span class="ml-2 text-sm text-gray-700 font-medium">Active User</span>
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="closeUserModal"
              type="button"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveUser"
              type="button"
              :disabled="savingUser || !userForm.phone || (!editingUser && !userForm.password)"
              class="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="savingUser">Saving...</span>
              <span v-else>{{ editingUser ? 'Update User' : 'Create User' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from '@/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const success = ref(null)
const activeTab = ref('shop')

// Form data
const form = reactive({
  shop_id: '',
  shop_name: '',
  phone: '',
  location: '',
  email_or_link: '',
})

// Shop data
const shopData = ref({
  logo: null
})

// User info
const userInfo = ref(null)

// Logo file
const logoFile = ref(null)
const logoInput = ref(null)

// Users management
const shopUsers = ref([])
const showCreateUserModal = ref(false)
const editingUser = ref(null)
const savingUser = ref(false)
const userForm = reactive({
  phone: '',
  password: '',
  username: '',
  role: 'cashier',
  can_manage_products: false,
  can_manage_sales: false,
  can_manage_purchases: false,
  can_view_reports: false,
  is_active: true
})

// Password change
const passwordForm = reactive({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const canChangePassword = computed(() => {
  return passwordForm.current_password && 
         passwordForm.new_password && 
         passwordForm.new_password.length >= 6 &&
         passwordForm.new_password === passwordForm.confirm_password
})

// Subscription data
const subscriptionData = ref(null)

// Handle logo change
const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    
    // Preview logo
    const reader = new FileReader()
    reader.onload = (e) => {
      shopData.value.logo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Load shop settings
const loadSettings = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🔍 Loading shop settings...')
    
    // First, get current user profile
    const userResponse = await axios.get('/user/profile/')
    userInfo.value = userResponse.data
    console.log('👤 User info:', userInfo.value)
    
    // Check if user is owner
    if (!userInfo.value.is_owner) {
      error.value = 'Only shop owner can access settings. Please contact your administrator.'
      loading.value = false
      return
    }
    
    // Then get shop settings
    const response = await axios.get('/shop/settings/')
    console.log('🏪 Shop settings response:', response.data)
    
    if (response.data.shop) {
      // Update form data
      form.shop_id = response.data.shop.shop_id || ''
      form.shop_name = response.data.shop.shop_name || ''
      form.phone = response.data.shop.phone || ''
      form.location = response.data.shop.location || ''
      form.email_or_link = response.data.shop.email_or_link || ''
      
      // Handle logo URL
      if (response.data.shop.logo || response.data.shop.logo_url) {
        shopData.value.logo = response.data.shop.logo_url || response.data.shop.logo
      }
    }
    
    // Load users
    await loadUsers()
    
    // Load subscription
    await loadSubscription()
    
  } catch (err) {
    console.error('❌ Error loading settings:', err)
    handleError(err, 'Failed to load settings')
  } finally {
    loading.value = false
  }
}

// Load shop users
const loadUsers = async () => {
  try {
    const response = await axios.get('/shop-users/')
    shopUsers.value = response.data.results || response.data || []
    console.log('👥 Loaded users:', shopUsers.value)
    console.log('👥 User count:', shopUsers.value.length)
  } catch (err) {
    console.error('❌ Error loading users:', err)
    error.value = `Failed to load users: ${err.response?.data?.detail || err.message}`
  }
}

// Load subscription data
const loadSubscription = async () => {
  try {
    const response = await axios.get('/subscription-status/')
    subscriptionData.value = response.data
    console.log('💳 Subscription data:', subscriptionData.value)
  } catch (err) {
    console.error('❌ Error loading subscription:', err)
    error.value = `Failed to load subscription: ${err.response?.data?.detail || err.message}`
    subscriptionData.value = null
  }
}

// Save settings
const saveSettings = async () => {
  try {
    saving.value = true
    error.value = null
    success.value = null
    
    console.log('Saving shop settings:', form)
    
    // Create FormData for file upload
    const formData = new FormData()
    
    // Add form fields
    Object.keys(form).forEach(key => {
      if (form[key] !== undefined && form[key] !== null) {
        formData.append(key, form[key])
      }
    })
    
    // Add logo if changed
    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }
    
    // Send PUT request
    const response = await axios.put('/shop/settings/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    console.log('Save response:', response.data)
    
    success.value = 'Shop settings saved successfully!'
    
    // Reset logo file
    logoFile.value = null
    
    // Update local shop data
    if (response.data.shop?.logo) {
      shopData.value.logo = response.data.shop.logo
    }
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (err) {
    console.error('Error saving settings:', err)
    handleError(err, 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  loadSettings()
}

// User Management Functions
const editUser = (user) => {
  editingUser.value = user
  userForm.phone = user.phone
  userForm.username = user.username || ''
  userForm.role = user.role
  userForm.can_manage_products = user.can_manage_products || false
  userForm.can_manage_sales = user.can_manage_sales || false
  userForm.can_manage_purchases = user.can_manage_purchases || false
  userForm.can_view_reports = user.can_view_reports || false
  userForm.is_active = user.is_active
  showCreateUserModal.value = true
}

const closeUserModal = () => {
  showCreateUserModal.value = false
  editingUser.value = null
  resetUserForm()
}

const resetUserForm = () => {
  userForm.phone = ''
  userForm.password = ''
  userForm.username = ''
  userForm.role = 'cashier'
  userForm.can_manage_products = false
  userForm.can_manage_sales = false
  userForm.can_manage_purchases = false
  userForm.can_view_reports = false
  userForm.is_active = true
}

const saveUser = async () => {
  try {
    savingUser.value = true
    error.value = null
    success.value = null
    
    const payload = {
      phone: userForm.phone,
      username: userForm.username || null,
      role: userForm.role,
      can_manage_products: userForm.can_manage_products,
      can_manage_sales: userForm.can_manage_sales,
      can_manage_purchases: userForm.can_manage_purchases,
      can_view_reports: userForm.can_view_reports,
      is_active: userForm.is_active
    }
    
    if (!editingUser.value && userForm.password) {
      payload.password = userForm.password
    }
    
    console.log('Saving user with payload:', payload)
    
    let response
    if (editingUser.value) {
      response = await axios.put(`/shop-users/${editingUser.value.id}/`, payload)
      success.value = 'User updated successfully!'
    } else {
      response = await axios.post('/shop-users/', payload)
      success.value = 'User created successfully!'
    }
    
    console.log('User save response:', response.data)
    
    closeUserModal()
    await loadUsers()
    
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (err) {
    console.error('Error saving user:', err)
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    })
    handleError(err, 'Failed to save user')
  } finally {
    savingUser.value = false
  }
}

const toggleUserStatus = async (user) => {
  if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`)) {
    return
  }
  
  try {
    const response = await axios.patch(`/shop-users/${user.id}/`, {
      is_active: !user.is_active
    })
    
    success.value = `User ${user.is_active ? 'deactivated' : 'activated'} successfully!`
    await loadUsers()
    
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (err) {
    console.error('Error toggling user status:', err)
    handleError(err, 'Failed to update user status')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Are you sure you want to delete user ${user.phone}? This action cannot be undone.`)) {
    return
  }
  
  try {
    await axios.delete(`/shop-users/${user.id}/`)
    success.value = 'User deleted successfully!'
    await loadUsers()
    
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (err) {
    console.error('Error deleting user:', err)
    handleError(err, 'Failed to delete user')
  }
}

// Password Management
const changePassword = async () => {
  try {
    error.value = null
    success.value = null
    
    // Verify current password by attempting to login
    try {
      await axios.post('/auth/login/', {
        phone: userInfo.value.phone,
        password: passwordForm.current_password
      })
    } catch (loginErr) {
      error.value = 'Current password is incorrect'
      return
    }
    
    // If current password is correct, update to new password
    const response = await axios.post(`/shop-users/${userInfo.value.id}/update-password/`, {
      password: passwordForm.new_password
    })
    
    success.value = 'Password changed successfully!'
    resetPasswordForm()
    
    setTimeout(() => {
      success.value = null
    }, 3000)
    
  } catch (err) {
    console.error('Error changing password:', err)
    handleError(err, 'Failed to change password')
  }
}

const resetPasswordForm = () => {
  passwordForm.current_password = ''
  passwordForm.new_password = ''
  passwordForm.confirm_password = ''
}

// Subscription Management
const refreshSubscription = async () => {
  await loadSubscription()
  success.value = 'Subscription refreshed!'
  setTimeout(() => {
    success.value = null
  }, 2000)
}

// Utility Functions
const handleError = (err, defaultMessage) => {
  if (err.response) {
    console.error('Response data:', err.response.data)
    console.error('Response status:', err.response.status)
    
    if (err.response.status === 403) {
      error.value = 'Access denied. Only shop owners can perform this action.'
    } else if (err.response.status === 401) {
      error.value = 'Please login to continue.'
      router.push('/login')
    } else if (err.response.status === 400) {
      const errors = err.response.data
      if (typeof errors === 'object' && !errors.detail) {
        error.value = Object.values(errors).flat().join(', ')
      } else {
        error.value = errors.detail || defaultMessage
      }
    } else {
      error.value = err.response.data?.detail || err.response.data?.message || defaultMessage
    }
  } else if (err.request) {
    error.value = 'No response from server. Check your connection.'
  } else {
    error.value = err.message || defaultMessage
  }
}

const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-purple-100 text-purple-800',
    seller: 'bg-blue-100 text-blue-800',
    cashier: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
}

const getSubscriptionStatusClass = () => {
  if (!subscriptionData.value) return 'text-gray-800'
  const status = subscriptionData.value.status?.toLowerCase()
  if (status === 'active') return 'text-green-600'
  if (status === 'expired') return 'text-red-600'
  if (status === 'expiring_soon') return 'text-yellow-600'
  return 'text-gray-800'
}

const getDaysRemainingClass = () => {
  if (!subscriptionData.value?.days_remaining) return 'text-gray-600'
  const days = subscriptionData.value.days_remaining
  if (days <= 3) return 'text-red-600 font-semibold'
  if (days <= 7) return 'text-yellow-600'
  return 'text-green-600'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// On component mount
onMounted(() => {
  console.log('ShopSettings component mounted')
  loadSettings()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
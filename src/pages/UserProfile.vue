<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Error</h3>
            <p class="text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
        <div class="mt-4">
          <button @click="loadProfile" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 mr-3">
            Retry
          </button>
          <button @click="$router.push('/dashboard')" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-4xl mx-auto">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Profile & Settings</h1>
          <p class="text-gray-600 mt-1">Shop ID: {{ shop.shop_id }}</p>
        </div>
        <button @click="$router.push('/dashboard')" class="px-4 py-2 text-gray-600 hover:text-gray-900">
          ← Back to Dashboard
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-xl shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Shop Information</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input v-model="form.shop_name" type="text" class="w-full px-3 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input v-model="form.phone" type="text" class="w-full px-3 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea v-model="form.location" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
              
              <div class="pt-4">
                <button @click="saveProfile" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div>
          <div class="bg-white rounded-xl shadow p-6 mb-6">
            <h3 class="text-lg font-semibold mb-4">Subscription</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Plan</span>
                <span class="font-medium">{{ shop.plan }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status</span>
                <span :class="shop.is_active ? 'text-green-600' : 'text-red-600'">
                  {{ shop.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Expires</span>
                <span>{{ formatDate(shop.expire_date) }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow p-6">
            <h3 class="text-lg font-semibold mb-4">User Info</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Username</span>
                <span class="font-medium">{{ user.username }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Role</span>
                <span class="font-medium">{{ user.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const router = useRouter()
const loading = ref(true)
const error = ref(null)

// User data
const user = reactive({
  username: '',
  email: '',
  role: ''
})

// Shop data
const shop = reactive({
  shop_id: '',
  shop_name: '',
  phone: '',
  location: '',
  email_or_link: '',
  plan: 'trial',
  is_active: false,
  expire_date: null
})

// Form data
const form = reactive({
  shop_name: '',
  phone: '',
  location: '',
  email_or_link: ''
})

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  } catch {
    return dateString
  }
}

// Load profile
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('Loading profile...')
    
    // Test if API is reachable
    const token = localStorage.getItem('access_token')
    if (!token) {
      error.value = 'Not logged in'
      router.push('/login')
      return
    }

    // Make the API call
    const response = await axios.get('/user/profile/')
    console.log('Profile response:', response.data)

    const data = response.data
    
    // Set user data
    user.username = data.username || ''
    user.email = data.email || ''
    user.role = data.role || ''

    // Set shop data
    if (data.shop) {
      Object.assign(shop, {
        shop_id: data.shop.shop_id || '',
        shop_name: data.shop.shop_name || '',
        phone: data.shop.phone || data.phone || '', // Get phone from shop or user
        location: data.shop.location || '',
        email_or_link: data.shop.email_or_link || '',
        plan: data.shop.plan || 'trial',
        is_active: data.shop.is_active || false,
        expire_date: data.shop.expire_date || null
      })

      // Set form data
      form.shop_name = shop.shop_name
      form.phone = shop.phone
      form.location = shop.location
      form.email_or_link = shop.email_or_link
    } else {
      error.value = 'No shop data found'
    }

  } catch (err) {
    console.error('Error loading profile:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please login again.'
      localStorage.removeItem('access_token')
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 404) {
      error.value = 'Profile not found'
    } else if (err.response?.data?.detail) {
      error.value = err.response.data.detail
    } else if (err.message === 'Network Error') {
      error.value = 'Network error. Please check connection.'
    } else {
      error.value = 'Failed to load profile'
    }
  } finally {
    loading.value = false
  }
}

// Save profile
const saveProfile = async () => {
  try {
    // First update via shop settings
    const response = await axios.put('/shop/settings/', {
      shop_name: form.shop_name,
      location: form.location,
      email_or_link: form.email_or_link
      // Note: Phone is not in Shop model, so we skip it
    })

    // Update local state
    Object.assign(shop, {
      shop_name: form.shop_name,
      location: form.location,
      email_or_link: form.email_or_link
    })

    alert('Profile updated successfully')
    
  } catch (err) {
    console.error('Error saving profile:', err)
    alert('Failed to save: ' + (err.response?.data?.detail || 'Unknown error'))
  }
}

// Lifecycle
onMounted(() => {
  console.log('Profile component mounted')
  loadProfile()
})
</script>
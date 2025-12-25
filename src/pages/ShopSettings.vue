<template>
  <div v-if="loading" class="text-center py-8">
    <div class="text-gray-500">Loading shop settings...</div>
  </div>

  <div v-else class="max-w-2xl mx-auto p-6">
    <!-- Debug Info (remove in production) -->
    <div v-if="debugMode" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
      <h4 class="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
      <pre class="text-xs text-gray-700 overflow-auto max-h-40">{{ debugInfo }}</pre>
      <button @click="debugMode = false" class="mt-2 text-xs text-yellow-700">Hide Debug</button>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-800">Shop Settings</h2>
      <p class="text-gray-600 mt-1">Manage your shop information and branding</p>
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

    <!-- Current Shop Info -->
    <div class="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Shop Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

    <!-- Current User Info (for debugging) -->
    <div v-if="userInfo" class="mt-8 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Current User Info</h4>
      <div class="text-sm text-gray-600">
        <p>Role: <span class="font-medium">{{ userInfo.role }}</span></p>
        <p>Shop Owner: <span class="font-medium">{{ userInfo.is_owner ? 'Yes' : 'No' }}</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from '@/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const success = ref(null)
const debugMode = ref(false)
const debugInfo = ref({})

// Form data
const form = reactive({
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
    console.log('📞 Calling /shop/settings/ endpoint...')
    const response = await axios.get('/shop/settings/')
    console.log('🏪 Shop settings response:', response.data)
    console.log('📊 Response structure:', {
      hasShop: !!response.data.shop,
      hasUser: !!response.data.user,
      keys: Object.keys(response.data)
    })
    
    if (response.data.shop) {
      // Update form data
      form.shop_name = response.data.shop.shop_name || ''
      form.phone = response.data.shop.phone || ''
      form.location = response.data.shop.location || ''
      form.email_or_link = response.data.shop.email_or_link || ''
      
      // Handle logo URL
      if (response.data.shop.logo || response.data.shop.logo_url) {
        shopData.value.logo = response.data.shop.logo_url || response.data.shop.logo
      }
    }
    
    // Update user info from shop settings
    if (response.data.user) {
      userInfo.value = { ...userInfo.value, ...response.data.user }
    }
    
    debugInfo.value = {
      user: userInfo.value,
      shop: response.data,
      form: form
    }
    
  } catch (err) {
    console.error('❌ Error loading settings:', err)
    console.error('Full error object:', err)
    
    if (err.response) {
      console.error('Response data:', err.response.data)
      console.error('Response status:', err.response.status)
      console.error('Response headers:', err.response.headers)
      
      if (err.response.status === 403) {
        error.value = 'Access denied. Only shop owners can view settings.'
      } else if (err.response.status === 401) {
        error.value = 'Please login to access shop settings.'
        router.push('/login')
      } else if (err.response.status === 404) {
        error.value = 'Settings endpoint not found. Check API route.'
      } else {
        error.value = err.response.data?.detail || 
                     err.response.data?.message || 
                     `Error: ${err.response.status}`
      }
    } else if (err.request) {
      error.value = 'No response from server. Check your connection.'
      console.error('Request was made but no response:', err.request)
    } else {
      error.value = err.message || 'Failed to load settings'
    }
  } finally {
    loading.value = false
    console.log('✅ Loading complete, loading:', loading.value)
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
    
    success.value = 'Settings saved successfully!'
    
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
    
    if (err.response) {
      console.error('Response data:', err.response.data)
      console.error('Response status:', err.response.status)
      
      if (err.response.status === 403) {
        error.value = 'Only shop owner can update settings.'
      } else if (err.response.status === 400) {
        const errors = err.response.data
        if (typeof errors === 'object') {
          error.value = Object.values(errors).flat().join(', ')
        } else {
          error.value = errors.detail || 'Invalid data'
        }
      } else {
        error.value = err.response.data?.detail || `Error: ${err.response.status}`
      }
    } else if (err.request) {
      error.value = 'No response from server. Check your connection.'
    } else {
      error.value = err.message || 'Failed to save settings'
    }
  } finally {
    saving.value = false
  }
}

// Reset form to original values
const resetForm = () => {
  loadSettings()
}

// Toggle debug mode
const toggleDebug = () => {
  debugMode.value = !debugMode.value
}

// On component mount
onMounted(() => {
  console.log('ShopSettings component mounted')
  loadSettings()
  
  // Enable debug mode if URL has debug parameter
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('debug')) {
    debugMode.value = true
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
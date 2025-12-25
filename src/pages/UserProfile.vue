<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile information...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Error Loading Profile</h3>
            <p class="text-red-700 mt-1">{{ error }}</p>
            <button @click="loadProfile" class="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Shop Profile & Settings</h1>
        <p class="text-gray-600 mt-2">Manage your shop information and subscription</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-green-800 font-medium">{{ success }}</span>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Shop Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shop Information Card -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Shop Information</h2>
              <div class="flex items-center space-x-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      :class="shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ shop.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {{ capitalize(shop.plan) }}
                </span>
              </div>
            </div>

            <!-- Shop ID Display -->
            <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label class="block text-sm font-medium text-gray-500 mb-1">Shop ID</label>
              <div class="flex items-center">
                <code class="text-lg font-mono font-bold text-gray-900">{{ shop.shop_id }}</code>
                <button @click="copyShopId" class="ml-3 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                  Copy
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-2">Use this ID for payment verification and support requests</p>
            </div>

            <!-- Logo Section -->
            <div class="mb-8">
              <label class="block text-sm font-medium text-gray-700 mb-4">Shop Logo</label>
              <div class="flex items-start space-x-6">
                <!-- Logo Preview -->
                <div class="flex-shrink-0">
                  <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
                    <img 
                      v-if="shop.logo || logoPreview" 
                      :src="logoPreview || shop.logo" 
                      class="w-full h-full object-cover"
                      alt="Shop Logo"
                    />
                    <div v-else class="text-gray-400">
                      <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Logo Controls -->
                <div class="flex-1">
                  <div class="space-y-4">
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
                        {{ shop.logo ? 'Change Logo' : 'Upload Logo' }}
                      </button>
                      <button 
                        v-if="shop.logo"
                        @click="removeLogo"
                        type="button"
                        class="ml-3 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <p class="text-sm text-gray-500">Recommended: Square image, 300×300px or larger. PNG, JPG, or WebP.</p>
                    
                    <!-- Logo Upload Progress -->
                    <div v-if="uploadingLogo" class="pt-2">
                      <div class="flex items-center space-x-3">
                        <div class="flex-1 bg-gray-200 rounded-full h-2">
                          <div class="bg-orange-500 h-2 rounded-full" :style="{ width: logoUploadProgress + '%' }"></div>
                        </div>
                        <span class="text-sm text-gray-600">{{ logoUploadProgress }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shop Details Form -->
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Shop Name -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
                  <input
                    v-model="form.shop_name"
                    type="text"
                    :disabled="saving"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Your shop name"
                  />
                </div>

                <!-- Phone Number -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    :disabled="saving"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <!-- Location -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  v-model="form.location"
                  :disabled="saving"
                  rows="2"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Shop address"
                ></textarea>
              </div>

              <!-- Email/Website -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email or Website</label>
                <input
                  v-model="form.email_or_link"
                  type="text"
                  :disabled="saving"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="email@example.com or https://website.com"
                />
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-8 pt-6 border-t border-gray-200">
              <div class="flex justify-end">
                <button
                  @click="resetForm"
                  type="button"
                  :disabled="saving"
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 mr-3"
                >
                  Reset
                </button>
                <button
                  @click="saveShopInfo"
                  type="button"
                  :disabled="saving || !form.shop_name || !form.phone"
                  class="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg v-if="saving" class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Subscription & Info -->
        <div class="space-y-6">
          <!-- Subscription Status Card -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
            
            <!-- Plan Badge -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">Current Plan</span>
                <span class="text-lg font-bold" :class="{
                  'text-green-600': shop.plan === 'yearly',
                  'text-blue-600': shop.plan === 'monthly',
                  'text-gray-600': shop.plan === 'trial'
                }">
                  {{ capitalize(shop.plan) }} Plan
                </span>
              </div>
              
              <div v-if="shop.plan === 'trial'" class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-yellow-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <p class="text-sm text-yellow-800 font-medium">Trial Period</p>
                    <p class="text-sm text-yellow-700 mt-1">Your trial ends on {{ formatDate(shop.expire_date) }}</p>
                  </div>
                </div>
              </div>
              
              <div v-else class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <p class="text-sm text-green-800 font-medium">Active Subscription</p>
                    <p class="text-sm text-green-700 mt-1">Renews on {{ formatDate(shop.expire_date) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Indicators -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Account Status</span>
                <span :class="shop.is_active ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                  {{ shop.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Subscription Status</span>
                <span class="text-blue-600 font-medium">{{ capitalize(shop.plan) }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Expiry Date</span>
                <span class="font-medium">{{ formatDate(shop.expire_date) }}</span>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Days Remaining</span>
                <span class="font-medium" :class="daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'">
                  {{ daysRemaining }} days
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <button
                v-if="shop.plan === 'trial'"
                @click="upgradePlan"
                class="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Upgrade to Pro
              </button>
              
              <button
                @click="viewInvoice"
                class="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Invoice History
              </button>
              
              <button
                @click="contactSupport"
                class="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>

          <!-- Payment Information Card -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            
            <div class="space-y-4">
              <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-sm font-medium text-blue-800 mb-1">Bkash Merchant</p>
                <p class="text-lg font-bold text-blue-900">01791927084</p>
                <p class="text-xs text-blue-700 mt-1">Personal / Merchant</p>
              </div>
              
              <div class="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p class="text-sm font-medium text-purple-800 mb-1">Nagad Merchant</p>
                <p class="text-lg font-bold text-purple-900">01791927084</p>
                <p class="text-xs text-purple-700 mt-1">Personal / Merchant</p>
              </div>
              
              <div class="text-sm text-gray-600 space-y-2">
                <p class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  Send payment with your Shop ID in reference
                </p>
                <p class="flex items-start">
                  <svg class="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  After payment, submit verification in Payment Request
                </p>
              </div>
            </div>
            
            <button
              @click="goToPaymentRequest"
              class="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              Submit Payment Verification
            </button>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Registered On</span>
                <span class="font-medium">{{ formatDate(shop.created_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Last Updated</span>
                <span class="font-medium">{{ formatDate(shop.updated_at) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">User Role</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">{{ userRole }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/axios'

const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const uploadingLogo = ref(false)
const logoUploadProgress = ref(0)
const error = ref(null)
const success = ref(null)

// Data
const shop = reactive({
  shop_id: '',
  shop_name: '',
  phone: '',
  location: '',
  email_or_link: '',
  logo: null,
  plan: 'trial',
  is_active: false,
  expire_date: null,
  created_at: null,
  updated_at: null
})

const userRole = ref('owner')

// Form
const form = reactive({
  shop_name: '',
  phone: '',
  location: '',
  email_or_link: ''
})

// Logo
const logoPreview = ref(null)
const logoFile = ref(null)

// Helper Functions
const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const formatDate = (dateString) => {
  if (!dateString || dateString === 'null' || dateString === 'undefined') {
    return 'Not set'
  }
  
  try {
    let date
    const str = String(dateString).trim()
    
    if (str.includes('T')) {
      date = new Date(str)
    } else if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = str.split('-').map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(str)
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    const day = String(date.getDate()).padStart(2, '0')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[date.getMonth()]
    const yearFormatted = date.getFullYear()
    
    return `${day} ${month} ${yearFormatted}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Date error'
  }
}

const calculateDaysRemaining = (expireDate) => {
  if (!expireDate) return 0
  
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let expiry
    const str = String(expireDate).trim()
    
    if (str.includes('T')) {
      expiry = new Date(str)
    } else if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = str.split('-').map(Number)
      expiry = new Date(year, month - 1, day)
    } else {
      expiry = new Date(str)
    }
    
    if (isNaN(expiry.getTime())) {
      return 0
    }
    
    expiry.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  } catch (error) {
    console.error('Days calculation error:', error)
    return 0
  }
}

// Computed Properties
const displayExpireDate = computed(() => {
  return formatDate(shop.expire_date)
})

const daysRemaining = computed(() => {
  return calculateDaysRemaining(shop.expire_date)
})

// Load Profile
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🔍 Loading user profile...')
    
    // Get user profile
    const response = await axios.get('/user/profile/')
    console.log('✅ User profile response:', response.data)
    const userData = response.data
    
    // Debug: Check what data we have
    console.log('📊 Debug - Available data:')
    console.log('User role:', userData.role)
    console.log('Shop object:', userData.shop)
    console.log('Shop keys:', userData.shop ? Object.keys(userData.shop) : 'No shop')
    
    // Set user role
    userRole.value = userData.role || 'owner'
    
    // Check if shop data exists
    if (userData.shop) {
      console.log('✅ Found shop data')
      
      // Map ALL fields from shop object
      const shopData = userData.shop
      
      // Update shop reactive object
      shop.shop_id = shopData.shop_id || ''
      shop.shop_name = shopData.shop_name || ''
      
      // CRITICAL: Get phone number - check all possible field names
      shop.phone = shopData.phone || 
                   shopData.phone_number || 
                   shopData.mobile || 
                   shopData.contact_number || 
                   ''  // Empty string if not found
      
      console.log('📱 Phone number retrieved:', shop.phone)
      
      shop.location = shopData.location || ''
      shop.email_or_link = shopData.email_or_link || ''
      shop.logo = shopData.logo || null
      shop.plan = shopData.plan || 'trial'
      shop.is_active = shopData.is_active !== undefined ? shopData.is_active : true
      shop.expire_date = shopData.expire_date || null
      shop.created_at = shopData.created_at || null
      shop.updated_at = shopData.updated_at || null
      
      // If phone is still empty, check user level
      if (!shop.phone && userData.phone) {
        shop.phone = userData.phone
        console.log('📱 Got phone from user data:', shop.phone)
      }
      
      // Still no phone? Use placeholder
      if (!shop.phone) {
        shop.phone = '01XXXXXXXXX'
        console.log('⚠️ Using placeholder phone number')
      }
      
      // Update form with the retrieved data
      form.shop_name = shop.shop_name
      form.phone = shop.phone
      form.location = shop.location
      form.email_or_link = shop.email_or_link
      
      console.log('🎯 Profile loaded successfully')
      console.log('Final shop data:', {
        shop_id: shop.shop_id,
        shop_name: shop.shop_name,
        phone: shop.phone,
        plan: shop.plan,
        expire_date: shop.expire_date,
        days_remaining: daysRemaining.value
      })
      
    } else {
      console.warn('⚠️ No shop data found')
      error.value = 'No shop data available. Please contact support.'
    }
    
  } catch (err) {
    console.error('❌ Error loading profile:', err)
    
    // User-friendly error messages
    if (err.response?.status === 401 || err.response?.status === 403) {
      error.value = 'Session expired. Please login again.'
      localStorage.clear()
      setTimeout(() => router.push('/login'), 2000)
    } else if (err.response?.status === 404) {
      error.value = 'Profile not found. Please contact support.'
    } else if (err.response?.status === 500) {
      error.value = 'Server error. Please try again later.'
    } else if (!err.response) {
      error.value = 'Network error. Please check your internet connection.'
    } else {
      error.value = err.response?.data?.detail || 'Failed to load profile'
    }
  } finally {
    loading.value = false
  }
}
// Logo Upload Functions
const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size should be less than 5MB'
      return
    }
    
    if (!file.type.match('image.*')) {
      error.value = 'Please select an image file'
      return
    }
    
    logoFile.value = file
    
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = null
  shop.logo = null
}

const uploadLogo = async () => {
  if (!logoFile.value) return
  
  try {
    uploadingLogo.value = true
    logoUploadProgress.value = 0
    
    const formData = new FormData()
    formData.append('logo', logoFile.value)
    
    const interval = setInterval(() => {
      if (logoUploadProgress.value < 90) {
        logoUploadProgress.value += 10
      }
    }, 100)
    
    const response = await axios.post('/shop/update-logo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        logoUploadProgress.value = progress
      }
    })
    
    clearInterval(interval)
    logoUploadProgress.value = 100
    
    if (response.data.logo_url) {
      shop.logo = response.data.logo_url
      logoPreview.value = null
      logoFile.value = null
    }
    
    success.value = 'Logo updated successfully'
    
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to upload logo'
  } finally {
    uploadingLogo.value = false
    setTimeout(() => {
      logoUploadProgress.value = 0
      success.value = null
    }, 3000)
  }
}

// Test which save method works
const testSaveMethods = async () => {
  console.log('🔍 Testing save methods...')
  
  const testData = {
    shop_name: 'Test Shop',
    phone: '01111111111',
    location: 'Test Location'
  }
  
  const methods = [
    { name: 'PATCH /user/profile/', url: '/user/profile/', method: 'PATCH', data: { shop: testData } },
    { name: 'POST /user/profile/', url: '/user/profile/', method: 'POST', data: { shop: testData } },
    { name: 'PUT /shop/settings/', url: '/shop/settings/', method: 'PUT', data: testData },
    { name: 'PATCH /shop/settings/', url: '/shop/settings/', method: 'PATCH', data: testData },
    { name: 'POST /shop/settings/', url: '/shop/settings/', method: 'POST', data: testData }
  ]
  
  for (const test of methods) {
    try {
      console.log(`Testing ${test.name}...`)
      const response = await axios({
        method: test.method,
        url: test.url,
        data: test.data
      })
      console.log(`✅ ${test.name} works!`, response.data)
      return { success: true, method: test.method, url: test.url }
    } catch (err) {
      console.log(`❌ ${test.name} failed:`, err.response?.status, err.response?.data)
    }
  }
  
  return { success: false }
}

// Save Shop Info - Try different methods
const saveShopInfo = async () => {
  try {
    saving.value = true
    error.value = null
    success.value = null

    if (!form.shop_name?.trim()) return (error.value = "Shop name is required")
    if (!form.phone?.trim()) return (error.value = "Phone number is required")

    const fd = new FormData()
    fd.append("shop_name", form.shop_name.trim())
    fd.append("phone", form.phone.trim())
    fd.append("location", (form.location || "").trim())
    fd.append("email_or_link", (form.email_or_link || "").trim())

    if (logoFile.value) {
      fd.append("logo", logoFile.value)
    }

    const res = await axios.put("/shop/settings/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    // update UI state from response
    if (res.data?.shop) {
      Object.assign(shop, res.data.shop)
    } else {
      // fallback
      shop.shop_name = form.shop_name.trim()
      shop.phone = form.phone.trim()
      shop.location = (form.location || "").trim()
      shop.email_or_link = (form.email_or_link || "").trim()
    }

    success.value = "Shop information updated successfully"
    setTimeout(() => (success.value = null), 3000)
  } catch (e) {
    const msg = e?.response?.data?.detail || "Save failed"
    error.value = msg
    console.log("Save error:", e?.response?.status, e?.response?.data)
  } finally {
    saving.value = false
  }
}


// Alternative: Save using the correct method based on backend
const saveShopInfoAlternative = async () => {
  try {
    saving.value = true
    error.value = null
    success.value = null
    
    console.log('💾 Saving shop info (alternative method)...')
    
    // Validate
    if (!form.shop_name.trim() || !form.phone.trim()) {
      error.value = 'Shop name and phone number are required'
      saving.value = false
      return
    }
    
    const data = {
      shop_name: form.shop_name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      email_or_link: form.email_or_link.trim()
    }
    
    // Upload logo if changed
    if (logoFile.value) {
      await uploadLogo()
    }
    
    // FIRST, check what methods are allowed by the backend
    try {
      // Try OPTIONS request to see allowed methods
      console.log('🔍 Checking allowed methods...')
      const optionsResponse = await axios.options('/user/profile/')
      console.log('Allowed methods for /user/profile/:', optionsResponse.headers['allow'])
      
      const optionsResponse2 = await axios.options('/shop/settings/')
      console.log('Allowed methods for /shop/settings/:', optionsResponse2.headers['allow'])
    } catch (optionsErr) {
      console.log('OPTIONS request not supported, continuing...')
    }
    
    // Based on common Django REST patterns, try these:
    
    // Pattern 1: Update shop via PUT (backend expects PUT for updates)
    try {
      console.log('🔄 Trying PUT to shop settings...')
      const response = await axios.put('/shop/settings/', data)
      
      console.log('✅ Save successful via PATCH:', response.data)
      
      // Update local shop data
      if (response.data) {
        Object.keys(data).forEach(key => {
          if (key in shop) {
            shop[key] = data[key]
          }
        })
        shop.updated_at = new Date().toISOString()
      }
      
      success.value = 'Shop information updated successfully'
      
    } catch (patchErr) {
      console.log('❌ PATCH failed:', patchErr.response?.status)
      
      // Pattern 2: Create/Update via POST
      try {
        console.log('🔄 Method 1: Trying PUT /shop/settings/')
        const response = await axios.put('/shop/settings/', data)
        
        if (response.data) {
          Object.keys(data).forEach(key => {
            if (key in shop) {
              shop[key] = data[key]
            }
          })
          shop.updated_at = new Date().toISOString()
        }
        
        success.value = 'Shop information updated successfully'
        
      } catch (postErr) {
        console.log('❌ POST failed:', postErr.response?.status)
        
        // Pattern 3: Update user profile with shop data
        try {
          console.log('🔄 Trying PATCH to user profile with shop data...')
          const response = await axios.patch('/user/profile/', {
            shop: data
          })
          
          console.log('✅ Save successful via user profile:', response.data)
          
          if (response.data.shop) {
            Object.assign(shop, response.data.shop)
          }
          
          success.value = 'Shop information updated successfully'
          
        } catch (profileErr) {
          console.error('❌ All save methods failed:', profileErr)
          error.value = profileErr.response?.data?.detail || 
                       'Unable to save changes. Please contact support.'
        }
      }
    }
    
    // Clear success message
    if (success.value) {
      setTimeout(() => {
        success.value = null
      }, 3000)
    }
    
  } catch (err) {
    console.error('💥 Error:', err)
    error.value = 'An error occurred while saving'
  } finally {
    saving.value = false
  }
}

// Reset Form
const resetForm = () => {
  form.shop_name = shop.shop_name || ''
  form.phone = shop.phone || ''
  form.location = shop.location || ''
  form.email_or_link = shop.email_or_link || ''
  logoFile.value = null
  logoPreview.value = null
  success.value = null
  error.value = null
}

// Other functions
const copyShopId = () => {
  navigator.clipboard.writeText(shop.shop_id)
    .then(() => {
      success.value = 'Shop ID copied to clipboard!'
      setTimeout(() => {
        success.value = null
      }, 2000)
    })
    .catch(err => {
      error.value = 'Failed to copy Shop ID'
    })
}

const upgradePlan = () => {
  router.push({
    path: '/payment-request',
    query: {
      shop_id: shop.shop_id,
      plan: 'monthly',
      amount: 750
    }
  })
}

const goToPaymentRequest = () => {
  router.push({
    path: '/payment-request',
    query: {
      shop_id: shop.shop_id,
      phone: shop.phone,
      plan: shop.plan,
      amount: shop.plan === 'monthly' ? 750 : 7990
    }
  })
}

const viewInvoice = () => {
  router.push('/sales')
}

const contactSupport = () => {
  const message = `Shop ID: ${shop.shop_id}\nShop Name: ${shop.shop_name}\nPhone: ${shop.phone}\nIssue: `
  const phone = '01791927084'
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, '_blank')
}

// Test API endpoints
const testEndpoints = async () => {
  console.log('🔍 Testing API endpoints...')
  
  const endpoints = [
    '/user/profile/',
    '/shop/settings/'
  ]
  
  for (const endpoint of endpoints) {
    try {
      // Test GET
      console.log(`Testing GET ${endpoint}...`)
      const getResponse = await axios.get(endpoint)
      console.log(`✅ GET ${endpoint} works`)
      
      // Test OPTIONS to see allowed methods
      try {
        const optionsResponse = await axios.options(endpoint)
        console.log(`📋 ${endpoint} allows:`, optionsResponse.headers['allow'] || 'No allow header')
      } catch (optionsErr) {
        console.log(`ℹ️ OPTIONS not supported for ${endpoint}`)
      }
      
    } catch (err) {
      console.log(`❌ GET ${endpoint} failed:`, err.response?.status)
    }
  }
}

// Lifecycle
onMounted(() => {
  console.log('🚀 UserProfile component mounted')
  loadProfile()
  
  // Test endpoints after a delay
  setTimeout(() => {
    testEndpoints()
  }, 1000)
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
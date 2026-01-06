<template>
  <!-- SIDEBAR FOR DESKTOP -->
  <aside
    class="border-r border-orange-100 bg-gradient-to-b from-white via-orange-50/30 to-amber-50/30 backdrop-blur-sm transition-all duration-500 z-40 shadow-lg shadow-orange-200/20"
    :class="[
      // MOBILE drawer
      props.isMobile
        ? (props.mobileOpen
            ? 'fixed inset-y-0 left-0 w-72 translate-x-0'
            : 'fixed inset-y-0 left-0 w-72 -translate-x-full')
        : '',

      // DESKTOP collapse
      !props.isMobile
        ? (isCollapsed 
            ? 'relative w-20 h-screen' 
            : 'relative w-72 h-screen')
        : ''
    ]"
  >
    <!-- Inner wrapper for sticky positioning -->
    <div class="sticky top-0 h-screen flex flex-col">
      <!-- Brand + Toggle -->
      <div class="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500">
        <!-- Brand -->
        <div v-if="!isCollapsed" class="leading-tight text-white">
          <p class="text-xl font-bold drop-shadow-md">{{ shop_name }}</p>
          <p class="text-xs opacity-90 mt-0.5">Point of Sale</p>
        </div>

        <!-- Brand logo when collapsed -->
        <div v-else class="mx-auto">
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
            <span class="text-white font-bold text-lg">P</span>
          </div>
        </div>

        <!-- Toggle button -->
        <button
          v-if="!props.isMobile"
          @click="toggleSidebar"
          class="ml-auto p-2 rounded-full border border-white/30 bg-white/20 hover:bg-white/30 shadow-lg flex items-center justify-center transition-all duration-300 group backdrop-blur-sm"
          :class="{ 'ml-0': isCollapsed }"
        >
          <svg
            class="w-5 h-5 text-white transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
            :class="{ 'rotate-180': isCollapsed }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div class="px-3 mb-4" v-if="!isCollapsed">
        </div>
        
        <router-link
          v-for="item in filteredNavItems"
          :key="item.name"
          :to="item.path"
          class="relative flex items-center gap-3 px-3 py-3.5 rounded-2xl text-sm group overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          :class="[
            $route.path === item.path
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-300/40 transform scale-[1.02]'
              : 'text-slate-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 hover:shadow-md'
          ]"
          @click="handleMobileClick"
        >
          <!-- Animated background effect -->
          <div 
            v-if="$route.path === item.path"
            class="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500"
          ></div>
          
          <!-- Animated active indicator -->
          <div
            v-if="$route.path === item.path"
            class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-10 rounded-full bg-white shadow-lg"
          ></div>

          <!-- Icon container with gradient -->
          <div 
            class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl z-10 transition-all duration-300 group-hover:scale-110"
            :class="[
              $route.path === item.path
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm'
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 transition-all duration-300"
              :class="[
                $route.path === item.path
                  ? 'text-white'
                  : 'text-orange-500 group-hover:text-orange-600 group-hover:scale-110'
              ]"
            />
          </div>

          <!-- Label -->
          <span
            v-if="!isCollapsed"
            class="font-semibold truncate z-10"
            :class="$route.path === item.path ? 'text-white' : 'text-slate-700'"
          >
            {{ item.name }}
          </span>

          <!-- Tooltip when collapsed -->
          <div
            v-if="isCollapsed"
            class="absolute left-full ml-4 px-3 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-xl before:content-[''] before:absolute before:top-1/2 before:-left-1 before:-translate-y-1/2 before:w-0 before:h-0 before:border-t-4 before:border-b-4 before:border-r-4 before:border-t-transparent before:border-b-transparent before:border-r-orange-600"
          >
            {{ item.name }}
          </div>
        </router-link>
      </nav>

      <!-- User/Status Section -->
      <div v-if="!isCollapsed" class="px-4 py-4 border-t border-orange-100">
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 shadow-inner">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center shadow-md">
            <span class="text-white font-bold">U</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">User Account</p>
            <p class="text-xs text-slate-500">Online</p>
          </div>
          <div class="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 shadow-md"></div>
        </div>
      </div>
    </div>
  </aside>

  <!-- MOBILE SIDEBAR DRAWER -->
  <transition name="slide">
    <aside
      v-if="isMobile && mobileOpen"
      class="fixed inset-y-0 left-0 z-50 w-72 border-r border-orange-100 bg-gradient-to-b from-white via-orange-50/30 to-amber-50/30 text-slate-700 shadow-2xl shadow-orange-500/20 flex flex-col backdrop-blur-sm"
    >
      <!-- Mobile header -->
      <div class="flex-shrink-0 flex items-center justify-between px-5 py-5 bg-gradient-to-r from-orange-500 to-amber-500">
        <!-- Brand -->
        <div class="leading-tight text-white">
          <p class="text-2xl font-bold drop-shadow-md">{{ shop_name }}</p>
          <p class="text-sm opacity-90 mt-1">Point of Sale</p>
        </div>

        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 shadow-lg"
          aria-label="Close menu"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p class="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2 px-3">Navigation</p>
        
        <router-link
          v-for="item in filteredNavItems"
          :key="item.name"
          :to="item.path"
          class="relative flex items-center gap-3 px-4 py-4 rounded-2xl text-sm group overflow-hidden transition-all duration-300"
          :class="[
            $route.path === item.path
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-300/40'
              : 'text-slate-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-700 hover:shadow-md'
          ]"
          @click="$emit('close')"
        >
          <!-- Active indicator -->
          <div
            v-if="$route.path === item.path"
            class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1.5 h-10 rounded-full bg-white shadow-lg"
          ></div>

          <!-- Icon container -->
          <div 
            class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl"
            :class="[
              $route.path === item.path
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm'
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5"
              :class="[
                $route.path === item.path
                  ? 'text-white'
                  : 'text-orange-500'
              ]"
            />
          </div>

          <!-- Label -->
          <span class="font-semibold truncate">
            {{ item.name }}
          </span>
        </router-link>
      </nav>

      <!-- Mobile user section -->
      <div class="px-4 py-4 border-t border-orange-100">
        <div class="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 shadow-inner">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center shadow-md">
            <span class="text-white font-bold">U</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-800">Mobile View</p>
            <p class="text-xs text-slate-500">Connected</p>
          </div>
        </div>
      </div>
    </aside>
  </transition>

  <!-- Mobile overlay -->
  <transition name="fade">
    <div
      v-if="isMobile && mobileOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    ></div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  mobileOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const route = useRoute()
const shop_name = ref('POS')
const isCollapsed = ref(false)
const isMobile = ref(false)
const userRole = ref('admin') // Default to admin

// Check if mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

// Icons with updated colors
const DashboardIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
}
const POSIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
}
const AddProductIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>',
}
const ProductsIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6"/></svg>',
}
const CustomerIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
}
const SalesIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
}
const ExpensesIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
}
const SuppliersIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>',
}
const StockIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
}
const SettingsIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
}
const LedgerIcon = {
  template:
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['admin', 'manager'] },
  { name: 'POS', path: '/pos', icon: POSIcon, roles: ['admin', 'manager', 'seller', 'cashier'] },
  { name: 'Add Product', path: '/add-product', icon: AddProductIcon, roles: ['admin', 'manager'] },
  { name: 'View Products', path: '/products', icon: ProductsIcon, roles: ['admin', 'manager'] },
  { name: 'Stock Details', path: '/stock-details', icon: StockIcon, roles: ['admin', 'manager'] },
  { name: 'Customers', path: '/customer', icon: CustomerIcon, roles: ['admin', 'manager', 'seller'] },
  { name: 'Customer Ledger', path: '/customer-ledger', icon: CustomerIcon, roles: ['admin', 'manager'] },
  { name: 'Due Payment', path: '/due-payment', icon: CustomerIcon, roles: ['admin', 'manager', 'seller'] },
  { name: 'Sales', path: '/sales', icon: SalesIcon, roles: ['admin', 'manager', 'seller'] },
  { name: 'Expenses', path: '/expenses', icon: ExpensesIcon, roles: ['admin', 'manager'] },
  { name: 'Cash Ledger', path: '/cash-ledger', icon: LedgerIcon, roles: ['admin', 'manager'] },
  { name: 'Suppliers', path: '/suppliers', icon: SuppliersIcon, roles: ['admin', 'manager'] },
  {name: 'Barcode Generator', path: '/barcode-generator', roles: ['admin', 'manager'] },
  { name: 'Settings', path: '/settings', icon: SettingsIcon, roles: ['admin', 'manager'] },
]

// Filter navigation items based on user role
const filteredNavItems = computed(() => {
  return navItems.filter(item => item.roles.includes(userRole.value))
})

const toggleSidebar = () => {
  if (!isMobile.value) {
    isCollapsed.value = !isCollapsed.value
  }
}

const handleMobileClick = () => {
  if (isMobile.value) {
    emit('close')
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  try {
    const shop = JSON.parse(localStorage.getItem('shop'))
    shop_name.value = shop?.shop_name || 'POS'
    
    // Get user role from localStorage - check multiple possible locations
    const user = JSON.parse(localStorage.getItem('user'))
    const userProfile = JSON.parse(localStorage.getItem('userProfile'))
    const authData = JSON.parse(localStorage.getItem('authData'))
    
    // Try different possible locations for role data
    const role = user?.role || user?.profile?.role || userProfile?.role || authData?.role || 'admin'
    userRole.value = role
    
    console.log('User Role:', userRole.value)
    console.log('User Data:', user)
  } catch (e) {
    console.error('Error loading user data:', e)
    shop_name.value = 'POS'
    userRole.value = 'admin'
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Slide animation for mobile sidebar */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}

/* Fade animation for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Smooth transitions for all interactive elements */
aside,
nav a,
nav span,
nav svg,
button {
  transition-property: all;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar */
nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: rgba(255, 165, 0, 0.1);
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #f97316, #f59e0b);
  border-radius: 10px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ea580c, #d97706);
}

/* Glow effect for active items */
nav a.router-link-active {
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
}
</style>
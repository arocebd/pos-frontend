<template>
  <!-- Added slide-up animation to the entire header -->
  <header 
    class="h-12 w-full bg-orange/80 backdrop-blur border-b border-orange-200 flex items-center fixed top-0 left-0 right-0 z-50 animate-slide-down"
    :class="{ 'animate-slide-up': !isScrolled }"
  >
    <!-- Left: mobile menu button -->
    <button
      class="lg:hidden ml-2 mr-1 p-2 rounded-md hover:bg-orange-500 border border-orange-400 transition-all duration-300 hover:scale-105 active:scale-95"
      @click="emit('open-sidebar')"
      type="button"
      aria-label="Open menu"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Ribbon tabs with enhanced animations -->
    <nav class="px-2 md:px-4 flex-1 overflow-x-auto scrollbar-hide">
      <ul class="flex items-center gap-1 md:gap-2 text-sm whitespace-nowrap">
        <li v-for="tab in tabs" :key="tab.label" class="shrink-0 relative">
          <!-- Pulsing dot indicator for active tab -->
          <div 
            v-if="isActive(tab)" 
            class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"
          ></div>
          
          <button
            class="shrink-0 flex items-center justify-center px-2 md:px-3 py-1.5 rounded-md border border-slate-200
                   text-slate-700 bg-white hover:bg-slate-50 transition-all duration-300 
                   hover:-translate-y-0.5 active:translate-y-0 min-w-[60px] md:min-w-0 relative group"
            :class="isActive(tab)
              ? '!bg-gradient-to-r !from-orange-500 !to-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200 scale-105'
              : 'hover:border-orange-300 hover:shadow-md'"
            @click="go(tab)"
            type="button"
          >
            <!-- Orange background effect on hover for inactive tabs -->
            <div 
              v-if="!isActive(tab)"
              class="absolute inset-0 bg-orange-500 rounded-md opacity-0 group-hover:opacity-10 transition-opacity duration-300"
            ></div>
            
            <!-- Tab content -->
            <span class="text-xs md:text-sm relative z-10 transition-all duration-300">
              {{ isMobile ? getMobileTabLabel(tab.label) : tab.label }}
            </span>
            
            <!-- Bottom orange bar for active tab -->
            <div 
              v-if="isActive(tab)"
              class="absolute -bottom-1 left-1/4 right-1/4 h-0.5 bg-orange-300 rounded-full animate-pulse"
            ></div>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Right: time + user menu -->
    <div class="flex items-center gap-2 md:gap-3 pr-2 md:pr-3">
      <!-- Time with fade animation -->
      <div class="flex items-center animate-fade-in">
        <span class="text-xs md:text-sm text-slate-500 hidden md:block">
          {{ formattedTime }}
        </span>
        <span class="text-xs text-slate-500 md:hidden">
          {{ timeLabel }}
        </span>
      </div>

      <!-- User dropdown with enhanced animations -->
      <div v-if="isLoggedIn" class="relative">
        <button
          class="flex items-center gap-1 md:gap-2 px-1 md:px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:scale-105"
          @click="dropdownOpen = !dropdownOpen"
          aria-label="User menu"
          :class="{ 'bg-orange-50 border border-orange-200': dropdownOpen }"
        >
          <!-- Avatar with scale animation -->
          <div class="transition-transform duration-300 hover:scale-110">
            <div
              v-if="avatarUrl"
              class="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border-2 border-orange-200 bg-slate-100"
            >
              <img :src="avatarUrl" alt="avatar" class="w-full h-full object-cover" />
            </div>
            <div
              v-else
              class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center text-xs md:text-sm font-semibold shadow-sm"
            >
              {{ initials }}
            </div>
          </div>

          <!-- Name + status -->
          <div class="hidden lg:flex flex-col leading-4 items-start">
            <span class="text-sm font-medium text-slate-800 truncate max-w-[100px]">
              {{ displayName }}
            </span>
            <span class="text-[11px] text-green-600 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </span>
          </div>
          
          <span class="hidden md:block lg:hidden text-sm font-medium text-slate-800 truncate max-w-[80px]">
            {{ displayName.split(' ')[0] }}
          </span>

          <!-- Animated caret -->
          <svg
            v-if="!isMobile"
            class="h-4 w-4 text-slate-500 transition-transform duration-300"
            :class="{ 'rotate-180': dropdownOpen }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <!-- Dropdown with slide animation -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95 -translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-2"
        >
          <div
            v-if="dropdownOpen"
            class="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden z-50 border border-orange-100"
          >
            <div class="px-3 py-2 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
              <p class="text-sm font-medium text-slate-800 truncate">
                {{ displayName }}
              </p>
              <p class="text-xs text-green-600 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Online
              </p>
            </div>

            <button
              class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-orange-50 transition-colors duration-200 flex items-center gap-2 hover:pl-4"
              @click="goProfile"
            >
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span class="flex-1">Profile</span>
              <span class="text-xs text-orange-400">→</span>
            </button>
            <button
              class="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors duration-200 flex items-center gap-2 hover:pl-4"
              @click="handleLogout"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="flex-1">Logout</span>
            </button>
          </div>
        </transition>
      </div>

      <!-- Login button with hover animation -->
      <button
        v-else
        class="px-2 md:px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 text-xs md:text-sm 
               hover:bg-teal-50 transition-all duration-300 hover:scale-105 hover:shadow-md 
               active:scale-95"
        @click="handleLogin"
      >
        <span class="hidden sm:inline">Login</span>
        <span class="sm:hidden">🔑</span>
      </button>
    </div>
  </header>
</template>


<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const emit = defineEmits(['open-sidebar'])

// Add mobile detection
const isMobile = ref(false)
function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const tabs = [
  { label: 'POS',            to: '/pos' },
  { label: 'Customer',       to: '/customer' },
  { label: 'Invoice Record', to: '/sales' },
  { label: 'Accounts',       to: '/business-overview' },
  { label: 'Reports',        to: '/sales-report' },
]

function go(tab) {
  if (route.path !== tab.to) {
    router.push(tab.to)
    // Close dropdown if open
    dropdownOpen.value = false
  }
}

function isActive(tab) {
  return route.path === tab.to || route.path.startsWith(tab.to + '/')
}

function getMobileTabLabel(label) {
  // Shorten labels for mobile
  const map = {
    'POS': 'POS',
    'Products': 'Prod',
    'Customer': 'Cust',
    'Invoice Record': 'Inv',
    'Accounts': 'Acct',
    'Reports': 'Rpt'
  }
  return map[label] || label.substring(0, 3)
}

const timeLabel = ref('')
const formattedTime = computed(() =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date())
)

// Update time every minute
let timeInterval
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

function updateTime() {
  const now = new Date()
  timeLabel.value = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  }).toLowerCase()
}

/* ---------- user state ---------- */
function loadUser() {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const user = ref(loadUser())
const dropdownOpen = ref(false)

const isLoggedIn = computed(() => !!user.value)

const displayName = computed(() => {
  if (!user.value) return 'Cashier'
  return (
    user.value.username ||
    user.value.name ||
    user.value.email ||
    'Cashier'
  )
})

const avatarUrl = computed(() => user.value?.avatarUrl || '')

const initials = computed(() => {
  const name = displayName.value
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function handleLogin() {
  router.push('/login')
}

function handleLogout() {
  localStorage.removeItem("user")
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("token") 
  user.value = null
  dropdownOpen.value = false
  router.push('/login')
}

function goProfile() {
  dropdownOpen.value = false
  router.push('/settings/')
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  const userMenu = document.querySelector('button[aria-label="User menu"]')
  if (userMenu && !userMenu.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Custom animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Enhanced scrollbar hiding */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  nav button {
    min-height: 36px;
  }
  
  /* Mobile tab animation */
  nav button:active {
    transform: scale(0.95);
  }
}

/* Header shadow enhancement */
header {
  box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06);
}

/* Orange glow effect for active tab */
.bg-gradient-to-r.from-orange-500.to-orange-600 {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
</style>
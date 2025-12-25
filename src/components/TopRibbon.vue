<template>
  <header class="h-12 w-full bg-white/80 backdrop-blur border-b flex items-center fixed top-0 left-0 right-0 z-50">
    <!-- Left: mobile menu button - hidden on medium screens and up -->
    <button
      class="lg:hidden ml-2 mr-1 p-2 rounded-md hover:bg-slate-100 border border-slate-200"
      @click="emit('open-sidebar')"
      type="button"
      aria-label="Open menu"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Ribbon tabs - better mobile scrolling -->
    <nav class="px-2 md:px-4 flex-1 overflow-x-auto scrollbar-hide">
      <ul class="flex items-center gap-1 md:gap-2 text-sm whitespace-nowrap">
        <li v-for="tab in tabs" :key="tab.label" class="shrink-0">
          <button
            class="shrink-0 flex items-center justify-center px-2 md:px-3 py-1.5 rounded-md border border-slate-200
                   text-slate-700 bg-white hover:bg-slate-50 transition-colors min-w-[60px] md:min-w-0"
            :class="isActive(tab)
              ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
              : ''"
            @click="go(tab)"
            type="button"
          >
            <!-- Show short label on mobile, full label on tablet and up -->
            <span class="text-xs md:text-sm">
              {{ isMobile ? getMobileTabLabel(tab.label) : tab.label }}
            </span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Right: time + user menu -->
    <div class="flex items-center gap-2 md:gap-3 pr-2 md:pr-3">
      <!-- Time - show simplified version on mobile -->
      <div class="flex items-center">
        <span class="text-xs md:text-sm text-slate-500 hidden md:block">
          {{ formattedTime }}
        </span>
        <span class="text-xs text-slate-500 md:hidden">
          {{ timeLabel }}
        </span>
      </div>

      <!-- Logged in: avatar + name + dropdown -->
      <div v-if="isLoggedIn" class="relative">
        <button
          class="flex items-center gap-1 md:gap-2 px-1 md:px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          @click="dropdownOpen = !dropdownOpen"
          aria-label="User menu"
        >
          <!-- avatar -->
          <div
            v-if="avatarUrl"
            class="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100"
          >
            <img :src="avatarUrl" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div
            v-else
            class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs md:text-sm font-semibold"
          >
            {{ initials }}
          </div>

          <!-- name + status -->
          <div class="hidden lg:flex flex-col leading-4 items-start">
            <span class="text-sm font-medium text-slate-800 truncate max-w-[100px]">
              {{ displayName }}
            </span>
            <span class="text-[11px] text-green-600">Online</span>
          </div>
          
          <!-- Show only name on medium screens -->
          <span class="hidden md:block lg:hidden text-sm font-medium text-slate-800 truncate max-w-[80px]">
            {{ displayName.split(' ')[0] }}
          </span>

          <!-- caret -->
          <svg
            v-if="!isMobile"
            class="h-4 w-4 text-slate-500"
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

        <!-- dropdown -->
        <div
          v-if="dropdownOpen"
          class="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden z-50"
        >
          <div class="px-3 py-2 border-b border-slate-100">
            <p class="text-sm font-medium text-slate-800 truncate">
              {{ displayName }}
            </p>
            <p class="text-xs text-green-600">Online</p>
          </div>

          <button
            class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            @click="goProfile"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          <button
            class="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <!-- Not logged in -->
      <button
        v-else
        class="px-2 md:px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 text-xs md:text-sm hover:bg-teal-50 transition-colors"
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
  { label: 'Products',       to: '/products' },
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
  router.push('/user/profile')
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
/* Hide scrollbar for tabs */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Ensure buttons have proper touch targets on mobile */
@media (max-width: 768px) {
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  nav button {
    min-height: 36px;
  }
}

/* Fix for fixed header */
header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
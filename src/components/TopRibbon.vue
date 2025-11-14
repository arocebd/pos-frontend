<template>
  <header class="h-12 w-full bg-white/80 backdrop-blur border-b flex items-center">
    <!-- Ribbon tabs -->
    <nav class="px-3 md:px-4 flex-1 overflow-x-auto">
      <ul class="flex items-center gap-1 text-sm">
        <li v-for="tab in tabs" :key="tab.label">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-md border text-slate-700 bg-white hover:bg-slate-50"
            :class="{ 'bg-teal-600 text-green-500 border-teal-600': isActive(tab) }"
            @click="go(tab)"
          >
            <span>{{ tab.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Right: time + user menu -->
    <div class="flex items-center gap-3 pr-3">
      <span class="text-[13px] text-slate-500 hidden md:block">
        {{ timeLabel }}
      </span>

      <!-- Logged in: avatar + name + dropdown -->
      <div v-if="isLoggedIn" class="relative">
        <button
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100"
          @click="dropdownOpen = !dropdownOpen"
        >
          <!-- avatar -->
          <div
            v-if="avatarUrl"
            class="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100"
          >
            <img :src="avatarUrl" alt="avatar" class="w-full h-full object-cover" />
          </div>
          <div
            v-else
            class="w-8 h-8 rounded-full bg-indigo-600 text-white grid place-items-center text-sm font-semibold"
          >
            {{ initials }}
          </div>

          <!-- name + status -->
          <div class="hidden sm:flex flex-col leading-4 items-start">
            <span class="text-sm font-medium text-slate-800">
              {{ displayName }}
            </span>
            <span class="text-[11px] text-green-600">Online</span>
          </div>

          <!-- caret -->
          <svg
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
          class="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 overflow-hidden z-50"
        >
          <div class="px-3 py-2 border-b border-slate-100">
            <p class="text-sm font-medium text-slate-800 truncate">
              {{ displayName }}
            </p>
          </div>

          <button
            class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            @click="goProfile"
          >
            Profile
          </button>
          <button
            class="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Not logged in AND no default user (you can keep this for later) -->
      <button
        v-else
        class="px-3 py-1.5 rounded-lg border border-teal-500 text-teal-600 text-sm hover:bg-teal-50"
        @click="handleLogin"
      >
        Login
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { label: 'POS',            to: '/pos' },
  { label: 'Products',       to: '/products' },
  { label: 'Customer',       to: '/customer' },
  { label: 'Invoice Record', to: '/sales' },
  { label: 'Accounts',       to: '/business-overview' },
  { label: 'Reports',        to: '/sales-report' },
]

function go(tab) {
  if (route.path !== tab.to) router.push(tab.to)
}
function isActive(tab) {
  return route.path === tab.to || route.path.startsWith(tab.to + '/')
}

const timeLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date())
)

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
  // ✅ prefer whatever we stored from Login.vue
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
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  user.value = null
  dropdownOpen.value = false
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}
</script>

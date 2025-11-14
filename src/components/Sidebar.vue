<template>
  <!-- PURE SIDEBAR, NO MAIN / NO ROUTER-VIEW -->
  <aside
    class="relative min-h-screen border-r border-slate-200 bg-gradient-to-b from-sky-50 via-sky-100 to-teal-50 text-slate-700 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-16' : 'w-64'"
  >
    <!-- Brand + Toggle -->
    <div class="flex items-center justify-between px-3 py-3 border-b border-slate-200">
      <!-- Brand -->
      <div v-if="!isCollapsed" class="flex items-center space-x-2">
        <div
          class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-sky-500 flex items-center justify-center shadow-sm"
        >
          <span class="font-semibold text-white text-sm">AZ</span>
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-slate-800">Al Zabeer</p>
          <p class="text-[11px] text-slate-500">Point of Sale</p>
        </div>
      </div>

      <!-- Toggle button -->
      <button
        @click="toggleSidebar"
        class="ml-auto p-1.5 rounded-full border border-slate-200 bg-white/80 hover:bg-slate-50 shadow-sm flex items-center justify-center transition-colors duration-200 group"
      >
        <svg
          class="w-4 h-4 text-slate-500 transform transition-transform duration-300 group-hover:scale-110"
          :class="{ 'rotate-180': isCollapsed }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="px-2 py-4 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        class="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm group overflow-hidden"
        :class="[
          $route.path === item.path
            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-teal-400/40'
            : 'text-slate-700 hover:bg-white/70 hover:text-teal-700'
        ]"
      >
        <!-- active bar -->
        <span
          v-if="$route.path === item.path"
          class="absolute inset-y-1 left-1 w-1 rounded-full bg-teal-500"
        ></span>

        <!-- Icon -->
        <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          <component
            :is="item.icon"
            class="w-5 h-5 transition-transform duration-200"
            :class="[
              $route.path === item.path
                ? 'text-teal-600'
                : 'text-slate-400 group-hover:text-teal-500 group-hover:scale-110'
            ]"
          />
        </div>

        <!-- Label -->
        <span
          v-if="!isCollapsed"
          class="font-medium truncate"
        >
          {{ item.name }}
        </span>

        <!-- Tooltip when collapsed -->
        <div
          v-if="isCollapsed"
          class="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg"
        >
          {{ item.name }}
        </div>
      </router-link>
    </nav>

    <!-- Decorative accent -->
    <div
      class="pointer-events-none absolute top-1/4 -right-6 h-24 w-24 rounded-full bg-teal-400/20 blur-2xl"
    ></div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

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

useRoute() // keeps $route reactive for class binding
const isCollapsed = ref(false)

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
  { name: 'POS', path: '/pos', icon: POSIcon },
  { name: 'Add Product', path: '/add-product', icon: AddProductIcon },
  { name: 'View Products', path: '/products', icon: ProductsIcon },
  { name: 'Customers', path: '/customer', icon: CustomerIcon },
  { name: 'Sales', path: '/sales', icon: SalesIcon },
  { name: 'Expenses', path: '/expenses' },
  { name: 'Suppliers', path: '/suppliers' },
]

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* nice subtle easing for width/icon/label changes */
aside,
nav a,
nav span,
nav svg {
  transition-property: all;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

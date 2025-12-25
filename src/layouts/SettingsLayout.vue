<template>
  <div class="settings-layout">
    <!-- Settings Sidebar -->
    <div class="settings-sidebar">
      <h3 class="sidebar-title">Settings</h3>
      <nav class="settings-nav">
        <router-link 
          to="/settings/shop" 
          class="nav-link"
          :class="{ active: $route.path === '/settings/shop' }"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          Shop Settings
        </router-link>
        
        <router-link 
          to="/settings/profile" 
          class="nav-link"
          :class="{ active: $route.path === '/settings/profile' }"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
          </svg>
          Profile
        </router-link>
        
        <router-link 
          to="/settings/subscription" 
          class="nav-link"
          :class="{ active: $route.path === '/settings/subscription' }"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 5.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10l1.293-1.293zm4 0a1 1 0 010 1.414L13.586 10l-1.293 1.293a1 1 0 01-1.414-1.414l2-2a1 1 0 011.414 0l2 2a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          Subscription
        </router-link>
        
        <router-link 
          to="/settings/users" 
          class="nav-link"
          :class="{ active: $route.path === '/settings/users' }"
          v-if="userRole === 'admin'"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
          </svg>
          Users
        </router-link>
      </nav>
    </div>
    
    <!-- Settings Content -->
    <div class="settings-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const userRole = computed(() => store.state.user?.role || '')
</script>

<style scoped>
.settings-layout {
  display: flex;
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
}

.settings-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 1.5rem;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.nav-link.active {
  background-color: #fef3c7;
  color: #92400e;
  font-weight: 500;
}

.settings-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
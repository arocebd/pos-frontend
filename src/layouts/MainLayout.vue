<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-sky-50 via-sky-100 to-teal-100 flex flex-col">
    <!-- Top Ribbon is now fixed -->
    <TopRibbon @open-sidebar="sidebarOpen = true" />

    <!-- Add padding top to account for fixed header -->
    <div class="pt-12 flex-1 flex flex-col">
      <!-- Mobile overlay -->
      <transition name="fade">
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          @click="sidebarOpen = false"
        />
      </transition>

      <!-- Main content area -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Sidebar -->
        <transition name="slide">
          <Sidebar 
            v-if="sidebarOpen || !isMobile" 
            :mobile-open="sidebarOpen" 
            @close="sidebarOpen = false"
            class="md:relative"
          />
        </transition>

        <!-- Main content -->
        <main class="flex-1 overflow-auto p-3 sm:p-4 md:p-6 transition-all duration-300">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>

      <!-- Footer -->
      <footer class="h-8 text-xs text-slate-500 px-4 flex items-center justify-between border-t bg-white/70 backdrop-blur-sm">
        <span class="truncate">Powered by AZ SoftBD</span>
        <span class="whitespace-nowrap">© {{ new Date().getFullYear() }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TopRibbon from '@/components/TopRibbon.vue'
import Sidebar from '@/components/Sidebar.vue'

const sidebarOpen = ref(false)
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
</script>
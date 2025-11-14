<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-sky-50 via-sky-100 to-teal-100">
    <TopRibbon />

    <div class="flex">
      <Sidebar />   <!-- our fancy sidebar only -->

      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>

    <footer
      class="h-8 text-[11px] text-slate-500 px-4 flex items-center justify-between border-t bg-white/70"
    >
      <span>Powered by Al Zabeer</span>
      <span>© {{ new Date().getFullYear() }}</span>
    </footer>
  </div>
</template>

<script setup>
import TopRibbon from '@/components/TopRibbon.vue'
import Sidebar from '@/components/Sidebar.vue'  // or ActionPanel if you prefer that name
</script>

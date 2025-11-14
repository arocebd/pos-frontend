<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-sky-50 via-sky-100 to-teal-100">
    <TopRibbon />
    <div class="flex">
      <ActionPanel />
      <main class="flex-1 p-4 md:p-6">
        <router-view />
      </main>
    </div>
    <footer class="h-8 text-[11px] text-slate-500 px-4 flex items-center justify-between border-t bg-white/70">
      <span>Powered by Al Zabeer</span>
      <span>© {{ new Date().getFullYear() }}</span>
    </footer>
  </div>
</template>

<script setup>
import TopRibbon from '@/components/TopRibbon.vue'
import ActionPanel from '@/components/ActionPanel.vue'
</script>

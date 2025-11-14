<template>
  <aside
    class="w-64 shrink-0 hidden md:flex flex-col bg-gradient-to-b from-sky-50 to-teal-100 border-r"
  >
    <div class="h-14 px-4 flex items-center gap-2 font-semibold text-teal-700">
      <svg class="h-6 w-6" viewBox="0 0 12 12" fill="currentColor">
        <path d="M7 4h13l-1 8H8L7 4Z" />
        <path d="M6 4H3v2h3V4Z" />
      </svg>
      Express Retail
    </div>

    <div class="px-3 pb-4 space-y-5 overflow-y-auto">
      <PanelGroup
        title="Dashboard"
        :items="[
          { label: 'supplier', to: '/supplier' },
          { label: 'Sales Return', to: '/sales-return' },
          { label: 'Purchase', to: '/purchase' },
          { label: 'Purchase Return', to: '/purchase-return' },
          { label: 'Transactions', to: '/transactions' }
        ]"
      />

      <PanelGroup
        title="Reports"
        :items="[
          { label: 'Sales Invoice', to: '/sales' },
          { label: 'supplier', to: '/suppliers' },
          { label: 'Purchase Record', to: '/reports/purchase' },
          { label: 'All Reports', to: '/reports' }
        ]"
      />
    </div>
  </aside>
</template>

<script setup>
const PanelGroup = {
  props: {
    title: { type: String, required: true },
    items: { type: Array, required: true },
  },
}
</script>

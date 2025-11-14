<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <img src="/logo.svg" class="h-9 w-9" alt="" />
      <h1 class="text-2xl font-semibold text-slate-800">Express Retail</h1>
    </div>

    <GlassWidget />

    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 class="font-semibold text-slate-800 mb-3">Quick Actions</h3>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <ActionBtn label="New Sale" to="/pos" />
          <ActionBtn label="Sales Return" to="/sales-return" />
          <ActionBtn label="New Purchase" to="/purchase" />
          <ActionBtn label="Customers" to="/customers" />
          <ActionBtn label="Suppliers" to="/suppliers" />
          <ActionBtn label="Products" to="/products" />
        </div>
      </div>

      <div class="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4">
        <h3 class="font-semibold text-slate-800 mb-3">Shortcuts</h3>
        <ul class="text-sm text-slate-700 space-y-2">
          <li><RouterLink to="/reports/sales" class="hover:text-teal-700">Sales Report</RouterLink></li>
          <li><RouterLink to="/reports/stock" class="hover:text-teal-700">Stock Report</RouterLink></li>
          <li><RouterLink to="/reports/purchase" class="hover:text-teal-700">Purchase Report</RouterLink></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import GlassWidget from '@/components/GlassWidget.vue'
const ActionBtn = {
  props:{ label:String, to:String },
  template: `
    <RouterLink :to="to"
      class="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-teal-600 to-sky-600 text-white
             hover:brightness-110 shadow-md text-center">
      {{ label }}
    </RouterLink>
  `
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
      <h2 class="text-2xl font-bold text-gray-800">Sales Report</h2>
      <div class="flex gap-2">
        <button
          class="px-3 py-2 rounded border hover:bg-gray-50"
          @click="applyQuickRange('today')"
        >Today</button>
        <button
          class="px-3 py-2 rounded border hover:bg-gray-50"
          @click="applyQuickRange('7d')"
        >Last 7 days</button>
        <button
          class="px-3 py-2 rounded border hover:bg-gray-50"
          @click="applyQuickRange('month')"
        >This month</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow p-4 mb-5">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start date</label>
          <input v-model="startDate" type="date" class="w-full border rounded px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End date</label>
          <input v-model="endDate" type="date" class="w-full border rounded px-3 py-2">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Report type</label>
          <select v-model="reportType" class="w-full border rounded px-3 py-2">
            <option value="summary">Summary</option>
            <option value="detail">Detail</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            :disabled="loading"
            class="w-full px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            @click="generate"
          >
            <span v-if="!loading">Generate</span>
            <span v-else>Loading…</span>
          </button>
        </div>
        <div class="flex items-end gap-2">
          <button
            class="w-full px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            :disabled="!report || loading"
            @click="exportReport('excel')"
          >
            Export Excel
          </button>
          <button
            class="w-full px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
            :disabled="!report || loading"
            @click="exportReport('pdf')"
          >
            Export PDF
          </button>
        </div>
      </div>

      <!-- Error -->
      <p v-if="error" class="mt-3 text-sm text-rose-600">{{ error }}</p>
    </div>

    <!-- Result -->
    <div v-if="report" class="bg-white rounded-xl shadow p-4">
      <!-- Summary cards -->
      <template v-if="report.report_type === 'summary'">
        <h3 class="text-lg font-semibold mb-3">Summary ({{ report.start_date }} → {{ report.end_date }})</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-lg border p-4">
            <p class="text-sm text-gray-500">Total Sales</p>
            <p class="text-2xl font-semibold">{{ money(report.summary.total_sales) }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-sm text-gray-500">Total Discount</p>
            <p class="text-2xl font-semibold">{{ money(report.summary.total_discount) }}</p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-sm text-gray-500">Total Profit</p>
            <p class="text-2xl font-semibold">
              <span v-if="report.summary.total_profit !== null">
                {{ money(report.summary.total_profit) }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </p>
          </div>
          <div class="rounded-lg border p-4">
            <p class="text-sm text-gray-500">Invoices</p>
            <p class="text-2xl font-semibold">{{ report.total_invoices }}</p>
          </div>
        </div>
      </template>

      <!-- Detail table -->
      <template v-else>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold">
            Detail ({{ report.start_date }} → {{ report.end_date }})
          </h3>
          <div v-if="pagedRecords.length" class="text-sm text-gray-500">
            Showing {{ pageStart + 1 }}–{{ pageStart + pagedRecords.length }}
            of {{ report.count }}
          </div>
        </div>

        <div class="overflow-auto rounded-lg border">
          <table class="min-w-[720px] w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr class="text-left">
                <th class="px-3 py-2 border-b">Invoice</th>
                <th class="px-3 py-2 border-b">Customer</th>
                <th class="px-3 py-2 border-b">Date</th>
                <th class="px-3 py-2 border-b text-right">Total</th>
                <th class="px-3 py-2 border-b text-right">Discount</th>
                <th class = "px-3 py-2 border-b text-right">Redeemed Points</th>
                <th class = "px-3 py-2 border-b text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pagedRecords" :key="i" class="hover:bg-gray-50">
                <td class="px-3 py-2 border-b">{{ r.invoice_no }}</td>
                <td class="px-3 py-2 border-b">{{ r.customer }}</td>
                <td class="px-3 py-2 border-b">{{ r.date }}</td>
                <td class="px-3 py-2 border-b text-right">{{ money(r.total) }}</td>
                <td class="px-3 py-2 border-b text-right">{{ money(r.discount) }}</td>
                <td class="px-3 py-2 border-b text-right">{{ r.redeemed_points || 0 }}</td>
                <td class="px-3 py-2 border-b text-right">
                  <span v-if="r.profit !== null">{{ money(r.profit) }}</span>
                  <span v-else class="text-gray-400">—</span></td>
              </tr>
              <tr v-if="!report.records.length">
                <td colspan="5" class="px-3 py-6 text-center text-gray-500">No records</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination (client-side simple) -->
        <div v-if="report.records.length" class="flex justify-between items-center mt-3">
          <div class="text-sm text-gray-500">Page {{ page + 1 }} / {{ totalPages }}</div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 rounded border disabled:opacity-50"
              :disabled="page === 0"
              @click="page--"
            >Prev</button>
            <button
              class="px-3 py-1 rounded border disabled:opacity-50"
              :disabled="page >= totalPages - 1"
              @click="page++"
            >Next</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from '../axios'

const startDate = ref('')
const endDate   = ref('')
const reportType = ref('summary')
const loading = ref(false)
const error = ref('')
const report = ref(null)

const page = ref(0)
const pageSize = ref(20)
const totalPages = computed(() =>
  report.value?.records ? Math.ceil(report.value.records.length / pageSize.value) : 0
)
const pageStart = computed(() => page.value * pageSize.value)
const pagedRecords = computed(() =>
  report.value?.records
    ? report.value.records.slice(pageStart.value, pageStart.value + pageSize.value)
    : []
)

function todayStr(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}` // backend expects YYYY-MM-DD
}

function applyQuickRange(which) {
  const now = new Date()
  if (which === 'today') {
    startDate.value = todayStr(now)
    endDate.value   = todayStr(now)
  } else if (which === '7d') {
    const from = new Date(now)
    from.setDate(from.getDate() - 6)
    startDate.value = todayStr(from)
    endDate.value   = todayStr(now)
  } else if (which === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate.value = todayStr(from)
    endDate.value   = todayStr(now)
  }
}

function money(n) {
  const v = Number(n ?? 0)
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function generate() {
  error.value = ''
  report.value = null
  page.value = 0

  if (!startDate.value || !endDate.value) {
    error.value = 'Please select start and end date.'
    return
  }
  if (startDate.value > endDate.value) {
    error.value = 'Start date cannot be after end date.'
    return
  }

  loading.value = true
  try {
    const res = await axios.get('/sales-report/', {
      params: {
        start_date: startDate.value,
        end_date: endDate.value,
        type: reportType.value,
      },
      responseType: 'json',
    })
    report.value = res.data
  } catch (e) {
    console.error('sales-report error:', e)
    error.value = e?.response?.data?.error || e?.message || 'Failed to load report.'
  } finally {
    loading.value = false
  }
}

function exportReport(fmt) {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select start and end date.'
    return
  }
  const url = new URL('/sales-report/')  
  url.searchParams.set('start_date', startDate.value)
  url.searchParams.set('end_date', endDate.value)
  url.searchParams.set('type', reportType.value)
  url.searchParams.set('export', fmt)
  window.open(url.toString(), '_blank')
}

// default
applyQuickRange('7d')
</script>

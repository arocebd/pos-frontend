<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Business Overview</h2>
      <div class="flex gap-2">
        <button @click="exportExcel" class="bg-emerald-600 text-white px-4 py-2 rounded hover:opacity-90">
          Export Excel
        </button>
        <button @click="exportPDF" class="bg-rose-600 text-white px-4 py-2 rounded hover:opacity-90">
          Export PDF
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-end">
      <div>
        <label class="block text-sm font-medium mb-1">Start Date</label>
        <input type="date" v-model="start_date" class="border rounded px-3 py-2 w-40" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">End Date</label>
        <input type="date" v-model="end_date" class="border rounded px-3 py-2 w-40" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Report Type</label>
        <select v-model="reportType" class="border rounded px-3 py-2 w-40">
          <option value="summary">Summary</option>
          <option value="timeseries">Time Series</option>
        </select>
      </div>
      <button @click="generate" class="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90 h-10">
        Generate
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading business overview...</div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded p-4">
      <div class="text-red-700 font-medium">Error: {{ error }}</div>
    </div>

    <!-- KPI cards -->
    <div v-if="overview && !loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <KpiCard title="Sales Revenue" :value="overview.total_income" variant="success"/>
      <KpiCard v-if="overview.total_vat_amount > 0" title="VAT Collected" :value="overview.total_vat_amount" variant="info"/>
      <KpiCard v-if="overview.total_vat_amount > 0" title="Base Sales Amount" :value="overview.base_sales_amount" variant="default"/>
      <KpiCard title="Total Expense" :value="overview.total_expense" variant="danger"/>
      <KpiCard title="Total Purchase" :value="overview.total_purchase" variant="default"/>
      <KpiCard title="Gross Profit" :value="overview.gross_profit" variant="info" :subtitle="`Sales Revenue (৳${fmtNum(overview.total_income)}) - Cost of Goods Sold`"/>
      <KpiCard title="Net Profit" :value="overview.net_profit" :variant="overview.net_profit >= 0 ? 'success' : 'danger'" :subtitle="`Gross Profit (৳${fmtNum(overview.gross_profit)}) - Expense (৳${fmtNum(overview.total_expense)})`"/>
      <KpiCard title="Business Growth %" :value="overview.business_growth" suffix="%" />
      <KpiCard title="Expenses" :value="overview.fixed_cost" variant="default"/>
      <KpiCard title="Cash Flow" :value="overview.cash_flow" :variant="overview.cash_flow >= 0 ? 'primary' : 'danger'"/>
      <KpiCard title="Inventory Value" :value="overview.total_stock_value" variant="default"/>
    </div>

    <!-- Charts -->
    <div v-if="ts.labels.length && !loading" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-2">Income vs Expense vs Purchase</h3>
        <div class="h-64">
          <canvas ref="ieChart"></canvas>
        </div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-2">Profit & Cash Flow</h3>
        <div class="h-64">
          <canvas ref="profitChart"></canvas>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="overview && ts.labels.length === 0 && !loading" class="text-center py-8">
      <div class="text-gray-500">No chart data available for the selected period.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '../axios'
import Chart from 'chart.js/auto'
import KpiCard from './KpiCard.vue' // Make sure this path is correct

const start_date = ref('')
const end_date = ref('')
const reportType = ref('summary')
const overview = ref(null)
const loading = ref(false)
const error = ref(null)

// time series data for charts
const ts = ref({ labels: [], income: [], expense: [], purchase: [], cash_flow: [], net_profit: [] })

// chart refs
const ieChart = ref(null)
const profitChart = ref(null)
let ieInstance = null
let profitInstance = null

function fmtNum(n) {
  return Number(n || 0).toFixed(2);
}

async function fetchSummary() {
  try {
    const { data } = await axios.get(`business-overview/`, {
      params: { 
        start_date: start_date.value, 
        end_date: end_date.value 
      },
    })
    return data
  } catch (error) {
    console.error('Error fetching summary:', error)
    throw new Error(error.response?.data?.error || 'Failed to fetch summary data')
  }
}

async function fetchTimeseries() {
  try {
    const { data } = await axios.get(`business-overview/timeseries/`, {
      params: { 
        start_date: start_date.value, 
        end_date: end_date.value 
      },
    })
    return data
  } catch (error) {
    console.error('Error fetching timeseries:', error)
    throw new Error(error.response?.data?.error || 'Failed to fetch timeseries data')
  }
}

function destroyCharts() {
  if (ieInstance) {
    ieInstance.destroy()
    ieInstance = null
  }
  if (profitInstance) {
    profitInstance.destroy()
    profitInstance = null
  }
}

function drawCharts() {
  destroyCharts()
  
  if (!ieChart.value || !profitChart.value) return

  // Chart 1: Income/Expense/Purchase
  const ieCtx = ieChart.value.getContext('2d')
  ieInstance = new Chart(ieCtx, {
    type: 'line',
    data: {
      labels: ts.value.labels,
      datasets: [
        { 
          label: 'Income', 
          data: ts.value.income,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.3,
        },
        { 
          label: 'Expense', 
          data: ts.value.expense,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
        },
        { 
          label: 'Purchase', 
          data: ts.value.purchase,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
          }
        } 
      },
    }
  })

  // Chart 2: Profit & Cash Flow
  const profitCtx = profitChart.value.getContext('2d')
  profitInstance = new Chart(profitCtx, {
    type: 'bar',
    data: {
      labels: ts.value.labels,
      datasets: [
        { 
          label: 'Net Profit', 
          data: ts.value.net_profit,
          backgroundColor: 'rgba(139, 92, 246, 0.7)',
        },
        { 
          label: 'Cash Flow', 
          data: ts.value.cash_flow,
          backgroundColor: 'rgba(14, 165, 233, 0.7)',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
          }
        } 
      },
    }
  })
}

async function generate() {
  try {
    loading.value = true
    error.value = null
    
    // Reset state
    overview.value = null
    ts.value = { labels: [], income: [], expense: [], purchase: [], cash_flow: [], net_profit: [] }
    destroyCharts()
    
    const [summaryData, timeseriesData] = await Promise.all([
      fetchSummary(),
      fetchTimeseries()
    ])
    
    overview.value = summaryData
    ts.value = timeseriesData
    
    if (timeseriesData.labels && timeseriesData.labels.length > 0) {
      // Use nextTick to ensure DOM is updated
      setTimeout(() => {
        drawCharts()
      }, 100)
    }
    
  } catch (err) {
    console.error('Error generating report:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function exportExcel() {
  if (!start_date.value || !end_date.value) {
    alert("Please select date range first");
    return;
  }

  try {
    const token = localStorage.getItem("access"); // ✅ get token

    const response = await axios.get(`/business-overview/export/excel/`, {
      params: {
        start_date: start_date.value,
        end_date: end_date.value,
      },
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send token
      },
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `business_overview_${start_date.value}_to_${end_date.value}.xlsx`
    );
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to export Excel:", err);
    alert("Failed to download Excel file. Check your login.");
  }
}


async function exportPDF() {
  if (!start_date.value || !end_date.value) {
    alert("Please select date range first");
    return;
  }

  try {
    const token = localStorage.getItem("access"); // 🔐 get JWT token

    const response = await axios.get(`/business-overview/export/pdf/`, {
      params: {
        start_date: start_date.value,
        end_date: end_date.value,
      },
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ send auth
      },
    });

    // 🔽 download file
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `business_overview_${start_date.value}_to_${end_date.value}.pdf`);
    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download PDF. Check login or try again.");
  }
}

onMounted(() => {
  // Set default dates (last 7 days)
  const today = new Date()
  const prior = new Date()
  prior.setDate(today.getDate() - 30) // Last 30 days for better data
  
  start_date.value = prior.toISOString().split('T')[0]
  end_date.value = today.toISOString().split('T')[0]
  
  generate()
})
</script>
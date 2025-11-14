<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Sales Dashboard</h1>
      <div class="text-sm text-gray-500">
        <span class="font-medium">Period:</span> {{ monthLabel }}
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-green-400 rounded-2xl p-5 shadow hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-black">Today’s Sales</p>
            <p class="text-2xl font-bold mt-1">৳ {{ fmtNumber(kpis.today_total) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-yellow-400 rounded-2xl p-5 shadow hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-black">This Month</p>
            <p class="text-2xl font-bold mt-1">৳ {{ fmtNumber(kpis.month_total) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-red-400 rounded-2xl p-5 shadow hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-black">Products in Stock</p>
            <p class="text-2xl font-bold mt-1">{{ fmtNumber(kpis.products_in_stock) }}</p>
          </div>
        </div>
      </div>

      <div class="bg-cyan-300 rounded-2xl p-5 shadow hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider text-black">Top Product</p>
            <p class="text-sm font-semibold mt-1 truncate" :title="topProduct.title || '-'">
              {{ topProduct.title || '—' }}
            </p>
            <p class="text-xs text-gray-500">Qty: {{ topProduct.qty || 0 }} | ৳{{ fmtNumber(topProduct.total || 0) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Daily Sales (Line) -->
      <div class="bg-white rounded-2xl p-5 shadow lg:col-span-2">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Daily Sales (This Month)</h3>
          <span class="text-xs text-gray-500">৳ / day</span>
        </div>
        <div class="h-64">
          <canvas ref="dailyLineRef"></canvas>
        </div>
      </div>

      <!-- Category-wise (Bar) -->
      <div class="bg-white rounded-2xl p-5 shadow">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Category-wise Sales (This Month)</h3>
          <span class="text-xs text-gray-500">৳ by category</span>
        </div>
        <div class="h-64">
          <canvas ref="categoryBarRef"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Products Table -->
    <div class="bg-white rounded-2xl p-5 shadow mt-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">Top Products (This Month)</h3>
        <span class="text-xs text-gray-500">Top {{ topProducts.length }} by qty</span>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="text-left px-3 py-2">#</th>
              <th class="text-left px-3 py-2">Product</th>
              <th class="text-right px-3 py-2">Qty</th>
              <th class="text-right px-3 py-2">Amount (৳)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in topProducts" :key="p.id" class="border-t">
              <td class="px-3 py-2">{{ i + 1 }}</td>
              <td class="px-3 py-2">{{ p.title }}</td>
              <td class="px-3 py-2 text-right">{{ p.qty }}</td>
              <td class="px-3 py-2 text-right">৳ {{ fmtNumber(p.total) }}</td>
            </tr>
            <tr v-if="!topProducts.length">
              <td colspan="4" class="px-3 py-4 text-center text-gray-400">No data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="mt-6 text-center text-gray-500">Loading dashboard…</div>
    <div v-if="error" class="mt-4 text-center text-red-600">⚠️ {{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../axios";
import Chart from "chart.js/auto";

// ----- State -----
const loading = ref(false);
const error = ref("");
const monthLabel = ref("");

const kpis = ref({
  today_total: 0,
  month_total: 0,
  products_in_stock: 0,
});

const topProduct = ref({ id: null, title: "", qty: 0, total: 0 });
const topProducts = ref([]); // list for table

// chart refs
const dailyLineRef = ref(null);
const categoryBarRef = ref(null);

// chart instances
let dailyChart, categoryChart;

// ----- Helpers -----
function fmtNumber(n) {
  const num = Number(n || 0);
  return num.toLocaleString("en-BD", { maximumFractionDigits: 0 });
}

function firstDayOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function lastDayOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function ymd(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ----- Fetch Dashboard Data -----
// This expects backend endpoints. If you don't have them yet,
// see the "Backend contract" note after the component.
async function loadDashboard() {
  loading.value = true;
  error.value = "";

  try {
    const now = new Date();
    const from = ymd(firstDayOfMonth(now));
    const to = ymd(lastDayOfMonth(now));
    monthLabel.value = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    // 1) KPIs
    // expected: { today_total, month_total, products_in_stock, top_product }
    const kpiRes = await axios.get(`/dashboard/metrics?from=${from}&to=${to}`);
    kpis.value.today_total = Number(kpiRes.data?.today_total || 0);
    kpis.value.month_total = Number(kpiRes.data?.month_total || 0);
    kpis.value.products_in_stock = Number(kpiRes.data?.products_in_stock || 0);
    if (kpiRes.data?.top_product) {
      topProduct.value = {
        id: kpiRes.data.top_product.id,
        title: kpiRes.data.top_product.title,
        qty: Number(kpiRes.data.top_product.qty || 0),
        total: Number(kpiRes.data.top_product.total || 0),
      };
    }

    // If products_in_stock missing, fallback to /products/ and sum stock
    if (!kpis.value.products_in_stock) {
      try {
        const prodRes = await axios.get("/products/?page_size=1000");
        const data = prodRes.data?.results || prodRes.data || [];
        kpis.value.products_in_stock = data.reduce((s, p) => s + (Number(p.stock) || 0), 0);
      } catch { /* ignore */ }
    }

    // 2) Daily sales for current month (line)
    // expected: [{date:'YYYY-MM-DD', total: number}]
    const dailyRes = await axios.get(`/dashboard/daily?from=${from}&to=${to}`);
    const daily = Array.isArray(dailyRes.data) ? dailyRes.data : [];
    renderDailyChart(daily);

    // 3) Category-wise sales for current month (bar)
    // expected: [{category:'Name', total:number, qty:number}]
    const catRes = await axios.get(`/dashboard/category-summary?from=${from}&to=${to}`);
    const categories = Array.isArray(catRes.data) ? catRes.data : [];
    renderCategoryChart(categories);

    // 4) Top products (table)
    // expected: [{id,title,qty,total}]
    const topRes = await axios.get(`/dashboard/top-products?from=${from}&to=${to}&limit=5`);
    topProducts.value = Array.isArray(topRes.data) ? topRes.data : [];

  } catch (e) {
    console.error(e);
    error.value = "Failed to load dashboard data.";
  } finally {
    loading.value = false;
  }
}

// ----- Charts -----
function renderDailyChart(daily) {
  const labels = [];
  const data = [];

  // Ensure every day of the month appears (fill 0s)
  const start = firstDayOfMonth();
  const end = lastDayOfMonth();
  const map = new Map(daily.map(d => [d.date, Number(d.total || 0)]));
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const key = ymd(dt);
    labels.push(dt.getDate()); // show day number
    data.push(map.get(key) || 0);
  }

  if (dailyChart) dailyChart.destroy();
  dailyChart = new Chart(dailyLineRef.value, {
    type: "line",
    data: {
      labels,
      datasets: [{ label: "Sales (৳)", data, tension: 0.3 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { callback: v => "৳ " + v.toLocaleString() } }
      }
    }
  });
}

function renderCategoryChart(rows) {
  const labels = rows.map(r => r.category || "—");
  const data = rows.map(r => Number(r.total || 0));

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(categoryBarRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Sales (৳)", data }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { callback: v => "৳ " + v.toLocaleString() } }
      }
    }
  });
}

onMounted(loadDashboard);
</script>

<style>
/* Keep visuals minimal and clean. Tailwind handles most of it. */
</style>

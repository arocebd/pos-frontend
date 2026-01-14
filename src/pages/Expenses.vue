<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Expense Management</h1>
      <button @click="openAdd = true" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
        + Add Expense
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label class="text-xs text-gray-500">From</label>
        <input type="date" v-model="fromDate" class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="text-xs text-gray-500">To</label>
        <input type="date" v-model="toDate" class="w-full border rounded p-2" />
      </div>
      <div>
        <label class="text-xs text-gray-500">Category</label>
        <select v-model="filters.category" class="w-full border rounded p-2">
          <option value="">All</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="flex items-end">
        <button @click="loadData" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full">
          Generate
        </button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="bg-white rounded-2xl shadow p-4">
        <p class="text-xs text-gray-500">Period</p>
        <p class="font-semibold">{{ fromDate || '—' }} → {{ toDate || '—' }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow p-4">
        <p class="text-xs text-gray-500">Total Expenses</p>
        <p class="text-2xl font-bold">৳ {{ formatMoney(summary.grand_total) }}</p>
      </div>
      <div class="bg-white rounded-2xl shadow p-4">
        <p class="text-xs text-gray-500">Top Category</p>
        <p class="font-semibold">{{ topCategoryName }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="px-3 py-2 text-left">Date</th>
            <th class="px-3 py-2 text-left">Category</th>
            <th class="px-3 py-2 text-left">Description</th>
            <th class="px-3 py-2 text-right">Amount (৳)</th>
            <th class="px-3 py-2 text-left">Payment</th>
            <th class="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in expenses" :key="e.id" class="border-t">
            <td class="px-3 py-2">{{ e.date }}</td>
            <td class="px-3 py-2">{{ e.category }}</td>
            <td class="px-3 py-2">{{ e.description || '—' }}</td>
            <td class="px-3 py-2 text-right">৳ {{ formatMoney(e.amount) }}</td>
            <td class="px-3 py-2">{{ e.payment_method }}</td>
            <td class="px-3 py-2 text-center">
              <button @click="remove(e.id)" class="text-red-600 hover:text-red-800">🗑️</button>
            </td>
          </tr>
          <tr v-if="!expenses.length">
            <td colspan="6" class="px-3 py-4 text-center text-gray-400">No expenses found</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="bg-gray-50 border-t">
            <td class="px-3 py-2 font-semibold" colspan="3">Total</td>
            <td class="px-3 py-2 text-right font-bold">৳ {{ formatMoney(summary.grand_total) }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Add Modal -->
    <div v-if="openAdd" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow p-5 w-full max-w-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Add Expense</h3>
          <button @click="openAdd = false" class="text-gray-500 hover:text-gray-700">✖</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-500">Date</label>
            <input type="date" v-model="form.date" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="text-xs text-gray-500">Category</label>
            <input v-model="form.category" list="categoryList" class="w-full border rounded p-2" placeholder="e.g., Rent" />
            <datalist id="categoryList">
              <option v-for="c in categories" :key="c" :value="c" />
            </datalist>
          </div>
          <div class="md:col-span-2">
            <label class="text-xs text-gray-500">Description</label>
            <textarea v-model="form.description" class="w-full border rounded p-2" rows="2" />
          </div>
          <div>
            <label class="text-xs text-gray-500">Amount (৳)</label>
            <input type="number" v-model.number="form.amount" min="0" class="w-full border rounded p-2 text-right" />
          </div>
          <div>
            <label class="text-xs text-gray-500">Payment Method</label>
            <select v-model="form.payment_method" class="w-full border rounded p-2">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Wallet</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="openAdd = false" class="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
          <button @click="save" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Save</button>
        </div>
      </div>
    </div>

    <!-- Error / Loading -->
    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../axios";

const expenses = ref([]);
const summary = ref({ grand_total: 0, by_category: [], by_day: [] });
const fromDate = ref("");
const toDate = ref("");
const filters = ref({ category: "" });
const categories = ref(["Rent", "Salary", "Utilities", "Internet", "Marketing", "Other"]);
const openAdd = ref(false);
const error = ref("");

// form
const form = ref({
  date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
  category: "",
  description: "",
  amount: 0,
  payment_method: "cash",
});

const topCategoryName = computed(() => {
  if (!summary.value.by_category.length) return "—";
  return summary.value.by_category[0].category + " (৳" + formatMoney(summary.value.by_category[0].total) + ")";
});

function formatMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-BD", { maximumFractionDigits: 0 });
}

async function loadData() {
  try {
    error.value = "";
    const params = new URLSearchParams();
    if (fromDate.value && toDate.value) {
      params.append("from", fromDate.value);
      params.append("to", toDate.value);
    }
    if (filters.value.category) {
      params.append("category", filters.value.category);
    }

    // Load expense list
    const listRes = await axios.get(`/expenses/?${params.toString()}`);
    expenses.value = listRes.data?.results || listRes.data || [];

    // Load summary safely
    try {
      const sumRes = await axios.get(`/expenses/summary/?${params.toString()}`);
      summary.value = sumRes.data || { grand_total: 0, by_category: [], by_day: [] };
    } catch (e) {
      console.warn("⚠️ Summary not available:", e.message);
      summary.value = { grand_total: 0, by_category: [], by_day: [] };
    }

  } catch (e) {
    console.error("❌ Load error:", e);
    error.value = "Failed to load expenses. Check backend connection.";
  }
}


async function save() {
  try {
    error.value = "";
    const payload = { ...form.value };
    // Optional: if you want to set custom date instead of auto_now_add:
    // backend model uses auto_now_add, so we pass date only if you later change to DateField(default=date.today)
    const res = await axios.post(`/expenses/`, payload);
    if (res.status === 201 || res.data?.id) {
      openAdd.value = false;
      // reset form
      form.value = {
        date: new Date().toISOString().slice(0, 10),
        category: "",
        description: "",
        amount: 0,
        payment_method: "cash",
      };
      await loadData();
    }
  } catch (e) {
    console.error(e);
    error.value = e.response?.data ? JSON.stringify(e.response.data) : "Failed to save expense.";
  }
}

async function remove(id) {
  if (!confirm("Delete this expense?")) return;
  try {
    await axios.delete(`/expenses/${id}/`);
    await loadData();
  } catch (e) {
    console.error(e);
    error.value = "Failed to delete expense.";
  }
}

onMounted(loadData);
</script>

<style>
/* Tailwind handles most styling */
</style>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-800">📘 Supplier Ledger</h2>
      <div class="flex gap-2">
        <button @click="goBack" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">← Back</button>
        <button @click="openPay()" class="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">＋ Add Payment</button>
      </div>
    </div>

    <!-- Supplier Summary -->
    <div class="bg-white rounded-lg shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <div class="text-xs text-gray-500">Supplier</div>
          <div class="font-semibold">{{ info.name }}</div>
          <div class="text-sm text-gray-600">{{ info.phone || "-" }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Total Purchase</div>
          <div class="font-semibold">৳ {{ formatCurrency(numbers.total_purchase) }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Total Paid</div>
          <div class="font-semibold text-green-700">৳ {{ formatCurrency(numbers.total_paid) }}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500">Total Due</div>
          <div class="font-semibold" :class="numbers.total_due > 0 ? 'text-red-600' : 'text-green-600'">
            ৳ {{ formatCurrency(numbers.total_due) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Export Buttons -->
    <div class="flex justify-end mb-4 space-x-3">
      <button @click="printLedger" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded">🖨️ Print</button>
      <button @click="exportPDF" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Export PDF</button>
      <button @click="exportExcel" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Export Excel</button>
    </div>

    <!-- Ledger Table -->
    <div ref="tableRef" class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-3 py-2 text-left">Date</th>
            <th class="px-3 py-2 text-left">Type</th>
            <th class="px-3 py-2 text-left">Memo</th>
            <th class="px-3 py-2 text-left">Details</th>
            <th class="px-3 py-2 text-right">Debit (৳)</th>
            <th class="px-3 py-2 text-right">Credit (৳)</th>
            <th class="px-3 py-2 text-right">Balance (৳)</th>
            <th class="px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ledger" :key="i" class="border-t align-top hover:bg-gray-50">
            <td class="px-3 py-2">{{ row.date }}</td>
            <td class="px-3 py-2">
              <span :class="getTypeBadgeClass(row.type)">{{ row.type }}</span>
            </td>
            <td class="px-3 py-2">{{ row.memo || row.invoice_no || '-' }}</td>
            <td class="px-3 py-2">
              <div v-if="row.items && row.items.length">
                <div v-for="it in row.items" :key="it.product" class="text-xs text-gray-600">
                  • {{ it.product }} — Qty {{ it.quantity }} × {{ formatCurrency(it.unit_price) }} = {{ formatCurrency(it.total) }}
                </div>
              </div>
              <div v-else class="text-xs text-gray-500">{{ row.details || row.remarks || "-" }}</div>
            </td>
            <td class="px-3 py-2 text-right font-mono">{{ row.debit ? formatCurrency(row.debit) : "-" }}</td>
            <td class="px-3 py-2 text-right font-mono">{{ row.credit ? formatCurrency(row.credit) : "-" }}</td>
            <td class="px-3 py-2 text-right font-mono font-medium" :class="getBalanceClass(row.balance)">
              {{ formatCurrency(row.balance) }}
            </td>
            <td class="px-4 py-2 text-center space-x-2">
              <button 
                v-if="row.type === 'Purchase'"
                @click="editPurchase(row)" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
              >
                Edit
              </button>
              <button 
                @click="deleteEntry(row)" 
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
              >
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="ledger.length === 0">
            <td colspan="8" class="text-center py-6 text-gray-500">No ledger entries found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Payment Modal -->
    <div v-if="showPay" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <h3 class="text-lg font-semibold mb-4">Add Payment</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-semibold mb-1">Amount (৳)</label>
            <input type="number" min="0" step="0.01" v-model.number="pay.amount" class="w-full border rounded p-2" placeholder="0.00"/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Payment Method</label>
            <select v-model="pay.payment_method" class="w-full border rounded p-2">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Wallet</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Memo No</label>
            <input v-model.trim="pay.memo_no" class="w-full border rounded p-2" placeholder="PAY-..."/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Remarks</label>
            <textarea v-model.trim="pay.remarks" rows="2" class="w-full border rounded p-2" placeholder="Optional notes..."></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-5">
          <button @click="showPay = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
          <button @click="savePayment" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save Payment</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../axios";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";

const route = useRoute();
const router = useRouter();

const supplierId = Number(route.params.id);
const info = ref({ name: "", phone: "", address: "" });
const numbers = ref({ total_purchase: 0, total_paid: 0, total_due: 0 });
const ledger = ref([]);
const tableRef = ref(null);

// Payment Modal
const showPay = ref(false);
const pay = ref({
  amount: 0,
  payment_method: "cash",
  memo_no: "",
  remarks: "",
});

// Utility Functions
function formatCurrency(value) {
  if (value === null || value === undefined) return "0.00";
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function getTypeBadgeClass(type) {
  const classes = {
    'Purchase': 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs',
    'Payment': 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
  };
  return classes[type] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs';
}

function getBalanceClass(balance) {
  return balance > 0 ? 'text-red-600' : 'text-green-600';
}

// Navigation
function goBack() {
  router.back();
}

// Data Fetching
async function fetchLedger() {
  try {
    const res = await axios.get(`/suppliers/${supplierId}/ledger/`);
    info.value = { 
      name: res.data.supplier, 
      phone: res.data.phone, 
      address: res.data.address 
    };
    numbers.value = {
      total_purchase: Number(res.data.total_purchase || 0),
      total_paid: Number(res.data.total_paid || 0),
      total_due: Number(res.data.total_due || 0),
    };
    ledger.value = res.data.ledger || [];
    console.log("📊 Ledger data loaded:", ledger.value);
  } catch (err) {
    console.error("❌ Failed to load ledger:", err?.response?.data || err);
    alert("Failed to load ledger data.");
  }
}

// Payment Functions
function openPay() {
  showPay.value = true;
}

async function savePayment() {
  try {
    const payload = {
      supplier: supplierId,
      amount: Number(pay.value.amount || 0),
      payment_method: pay.value.payment_method,
      memo_no: pay.value.memo_no || "",
      remarks: pay.value.remarks || "",
    };

    if (payload.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    await axios.post("/supplier-payments/", payload);
    alert("✅ Payment saved successfully!");
    showPay.value = false;
    pay.value = { amount: 0, payment_method: "cash", memo_no: "", remarks: "" };
    await fetchLedger();
  } catch (err) {
    console.error("❌ Payment save failed:", err?.response?.data || err);
    alert("Failed to save payment. Please try again.");
  }
}

// Edit Purchase Function
function editPurchase(purchaseEntry) {
  console.log("🔄 Editing purchase:", purchaseEntry);
  
  // Navigate to Add Purchase page with purchase ID for editing
  router.push({
    path: '/add-purchase',
    query: { 
      edit: purchaseEntry.id,
      supplier: supplierId 
    }
  });
}

// Delete Function
async function deleteEntry(entry) {
  try {
    if (!confirm(`Are you sure you want to delete this ${entry.type} record? This action cannot be undone.`)) {
      return;
    }
    
    let url;
    if (entry.type === 'Purchase') {
      url = `/purchases/${entry.id}/`;
    } else {
      url = `/supplier-payments/${entry.id}/`;
    }
    
    await axios.delete(url);
    await fetchLedger();
    alert("🗑️ Record deleted successfully!");
  } catch (err) {
    console.error("❌ Delete failed:", err?.response?.data || err);
    alert("Failed to delete record: " + (err.response?.data?.detail || err.message));
  }
}

// Export Functions
function printLedger() {
  window.print();
}

function exportPDF() {
  const el = tableRef.value;
  if (!el) {
    alert("Table element not found for PDF export");
    return;
  }
  
  const opt = {
    margin: 10,
    filename: `supplier_ledger_${supplierId}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
  };
  
  html2pdf().set(opt).from(el).save().catch(err => {
    console.error("PDF export failed:", err);
    alert("Failed to export PDF. Please try again.");
  });
}

function exportExcel() {
  const rows = ledger.value.map((r) => ({
    Date: r.date,
    Type: r.type,
    Memo: r.memo || r.invoice_no || "",
    Details: r.details || r.remarks || "",
    Debit: Number(r.debit || 0),
    Credit: Number(r.credit || 0),
    Balance: Number(r.balance || 0),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Supplier Ledger");
  XLSX.writeFile(wb, `supplier_ledger_${supplierId}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Lifecycle
onMounted(() => {
  fetchLedger();
});
</script>

<style scoped>
@media print {
  button {
    display: none !important;
  }
  
  .bg-white {
    box-shadow: none !important;
  }
  
  .max-w-6xl {
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .p-6 {
    padding: 0 !important;
  }
  
  .rounded-lg {
    border-radius: 0 !important;
  }
}
</style>
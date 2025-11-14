<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ isEditMode ? '✏️ Edit Purchase' : '🧾 Add Purchase' }}
      </h2>
      <div class="flex gap-2">
        <button @click="goBack" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">← Back</button>
        <button @click="toggleDebug" class="px-3 py-2 bg-yellow-500 text-white rounded">Debug</button>
      </div> 
    </div>

    <!-- Debug Info -->
    <div v-if="debugMode" class="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
      <h3 class="font-bold mb-2">Debug Information:</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold">Form Data:</h4>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(form, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-semibold">Items:</h4>
          <pre class="text-xs overflow-auto">{{ JSON.stringify(items, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading purchase data...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8 text-red-600">
      <div>Error loading purchase data: {{ error }}</div>
      <button @click="retryLoad" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Retry</button>
    </div>

    <!-- Main Form -->
    <div v-else>
      <!-- Top form -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Supplier -->
        <div class="bg-white rounded-lg shadow p-4">
          <label class="block text-sm font-semibold mb-1">Supplier *</label>
          <select v-model="form.supplier" class="w-full border rounded p-2" :disabled="isEditMode">
            <option :value="null" disabled>Select supplier</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

        <!-- Invoice + Date -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <label class="block text-sm font-semibold mb-1">Invoice No *</label>
            <input 
              v-model.trim="form.invoice_no" 
              class="w-full border rounded p-2" 
              placeholder="1234567890" 
              :disabled="isEditMode"
            />
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <label class="block text-sm font-semibold mb-1">Date</label>
            <input v-model="form.date" type="date" class="w-full border rounded p-2" />
          </div>
        </div>
      </div>

      <!-- Product search (only in add mode) -->
      <div v-if="!isEditMode" class="bg-white rounded-lg shadow p-4 mb-4">
        <div class="flex gap-2">
          <input
            v-model="search"
            @input="searchProducts"
            placeholder="Search product by name / code / barcode"
            class="flex-1 border rounded p-2"
          />
          <button @click="addByCode" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
        </div>

        <ul v-if="suggestions.length" class="mt-2 border rounded max-h-56 overflow-y-auto">
          <li
            v-for="p in suggestions"
            :key="p.id"
            @click="addItem(p)"
            class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between"
          >
            <span>{{ p.title }} ({{ p.product_code }})</span>
            <span class="text-gray-600">৳ {{ p.purchased_price || 0 }}</span>
          </li>
        </ul>
      </div>

      <!-- Items table -->
      <div class="bg-white rounded-lg shadow overflow-x-auto mb-4">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-3 py-2 text-left">#</th>
              <th class="px-3 py-2 text-left">Product</th>
              <th class="px-3 py-2 text-center">Qty</th>
              <th class="px-3 py-2 text-right">Unit (৳)</th>
              <th class="px-3 py-2 text-right">Total (৳)</th>
              <th class="px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in items" :key="row.pid" class="border-t">
              <td class="px-3 py-2">{{ i + 1 }}</td>
              <td class="px-3 py-2">{{ row.title }}</td>
              <td class="px-3 py-2 text-center">
                <input type="number" min="1" v-model.number="row.qty" class="w-20 border rounded text-center" />
              </td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0" step="0.01" v-model.number="row.unit" class="w-28 border rounded text-right" />
              </td>
              <td class="px-3 py-2 text-right">৳ {{ (row.qty * row.unit).toFixed(2) }}</td>
              <td class="px-3 py-2 text-center">
                <button @click="removeItem(i)" class="text-red-600 hover:text-red-800 px-2 py-1">🗑️ Remove</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="6" class="text-center py-6 text-gray-500">No items added.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-lg shadow p-4">
          <label class="block text-sm font-semibold mb-1">Remarks</label>
          <textarea v-model="form.remarks" rows="3" class="w-full border rounded p-2" placeholder="Note (optional)"></textarea>
        </div>

        <div class="bg-white rounded-lg shadow p-4 space-y-2">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <strong>৳ {{ subtotal.toFixed(2) }}</strong>
          </div>
          <div class="flex justify-between items-center">
            <span>Discount</span>
            <input type="number" min="0" step="0.01" v-model.number="form.discount" class="w-28 border rounded text-right p-1" />
          </div>
          <div class="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>৳ {{ total.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>Paid Amount</span>
            <input type="number" min="0" step="0.01" v-model.number="form.paid_amount" class="w-28 border rounded text-right p-1" />
          </div>
          <div class="flex justify-between text-sm text-gray-600">
            <span>Due Amount</span>
            <span>৳ {{ due.toFixed(2) }}</span>
          </div>

          <div class="flex justify-between items-center pt-2">
            <span>Payment Method</span>
            <select v-model="form.payment_method" class="border rounded p-1">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="mobile">Mobile Wallet</option>
              <option value="due">Due</option>
            </select>
          </div>

          <div class="text-right pt-4">
            <button @click="save" :disabled="saving" class="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400">
              {{ saving ? 'Saving...' : (isEditMode ? 'Update Purchase' : 'Save Purchase') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "../axios";

const route = useRoute();
const router = useRouter();

const suppliers = ref([]);
const search = ref("");
const suggestions = ref([]);
const items = ref([]);
const isEditMode = ref(false);
const purchaseId = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref(null);
const debugMode = ref(false);

const form = ref({
  supplier: null,
  invoice_no: "",
  date: new Date().toISOString().slice(0, 10),
  discount: 0,
  paid_amount: 0,
  payment_method: "cash",
  remarks: "",
});

const subtotal = computed(() =>
  items.value.reduce((s, r) => s + Number(r.qty || 0) * Number(r.unit || 0), 0)
);
const total = computed(() => Math.max(0, subtotal.value - Number(form.value.discount || 0)));
const due = computed(() => Math.max(0, total.value - Number(form.value.paid_amount || 0)));

function goBack() {
  router.back();
}

function toggleDebug() {
  debugMode.value = !debugMode.value;
}

async function retryLoad() {
  error.value = null;
  await loadPurchaseData();
}

async function fetchSuppliers() {
  try {
    const res = await axios.get("/suppliers/");
    suppliers.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Failed to fetch suppliers:", err);
  }
}

async function loadPurchaseData() {
  if (!purchaseId.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log("🔄 Fetching purchase data for ID:", purchaseId.value);
    
    const response = await axios.get(`/purchases/${purchaseId.value}/`);
    const purchase = response.data;
    console.log("📦 Purchase data received:", purchase);
    
    // Fill form data
    form.value = {
      supplier: purchase.supplier,
      invoice_no: purchase.invoice_no || "",
      date: purchase.date || new Date().toISOString().slice(0, 10),
      discount: Number(purchase.discount || 0),
      paid_amount: Number(purchase.paid_amount || 0),
      payment_method: purchase.payment_method || "cash",
      remarks: purchase.remarks || "",
    };
    
    // Fill items
    const purchaseItems = purchase.items || [];
    if (purchaseItems.length > 0) {
      items.value = purchaseItems.map(item => ({
        pid: item.product.id,
        title: item.product.title,
        qty: Number(item.quantity),
        unit: Number(item.purchase_price),
      }));
    } else {
      items.value = [];
    }
    
  } catch (err) {
    console.error("❌ Failed to load purchase data:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function searchProducts() {
  if (!search.value.trim()) { suggestions.value = []; return; }
  try {
    const res = await axios.get(`/products/?search=${encodeURIComponent(search.value)}`);
    suggestions.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Search failed:", err);
  }
}

async function addByCode() {
  if (!search.value.trim()) return;
  try {
    const res = await axios.get(`/products/?search=${encodeURIComponent(search.value)}`);
    const p = (res.data.results || res.data)[0];
    if (p) addItem(p);
    search.value = "";
    suggestions.value = [];
  } catch (err) {
    console.error("❌ Add by code failed:", err);
  }
}

function addItem(p) {
  const exists = items.value.find(x => x.pid === p.id);
  if (exists) { 
    exists.qty += 1; 
    return; 
  }
  items.value.push({
    pid: p.id,
    title: p.title,
    qty: 1,
    unit: Number(p.purchased_price || 0),
  });
  search.value = "";
  suggestions.value = [];
}

function removeItem(i) {
  items.value.splice(i, 1);
}

async function save() {
  // Validation
  if (!form.value.supplier) return alert("Please select a supplier.");
  if (!form.value.invoice_no.trim()) return alert("Please enter an invoice number.");
  if (items.value.length === 0) return alert("Please add at least one item.");

  saving.value = true;

  try {
    // Prepare items in the exact format expected by the serializer
    const itemsPayload = items.value.map(r => ({
      product: r.pid,
      quantity: parseInt(r.qty),
      purchase_price: parseFloat(Number(r.unit).toFixed(2)),
      // Remove total field if it's calculated automatically in the backend
    }));

    // Prepare the main payload
    const payload = {
      supplier: Number(form.value.supplier),
      invoice_no: form.value.invoice_no.trim(),
      date: form.value.date,
      subtotal: parseFloat(subtotal.value.toFixed(2)),
      discount: parseFloat(Number(form.value.discount || 0).toFixed(2)),
      total: parseFloat(total.value.toFixed(2)),
      paid_amount: parseFloat(Number(form.value.paid_amount || 0).toFixed(2)),
      payment_method: form.value.payment_method,
      remarks: form.value.remarks?.trim() || "",
      items: itemsPayload,
    };

    console.log("💾 Complete Payload:", JSON.stringify(payload, null, 2));
    console.log("📦 Items Payload:", JSON.stringify(itemsPayload, null, 2));

    if (isEditMode.value) {
      console.log("🔄 UPDATE Request to:", `/purchases/${purchaseId.value}/`);
      
      // For updates, try different approaches:
      
      // Approach 1: Try without items first (if items can't be updated)
      try {
        const updatePayloadWithoutItems = { ...payload };
        delete updatePayloadWithoutItems.items;
        
        console.log("🔄 Trying update WITHOUT items...");
        const response = await axios.put(`/purchases/${purchaseId.value}/`, updatePayloadWithoutItems);
        console.log("✅ UPDATE Success (without items):", response.data);
        alert("✅ Purchase updated successfully!");
      } catch (err) {
        console.log("❌ Update without items failed, trying with items...");
        
        // Approach 2: Try with items
        const response = await axios.put(`/purchases/${purchaseId.value}/`, payload);
        console.log("✅ UPDATE Success (with items):", response.data);
        alert("✅ Purchase updated successfully!");
      }
    } else {
      console.log("➕ CREATE Request to:", "/purchases/");
      const response = await axios.post("/purchases/", payload);
      console.log("✅ CREATE Success:", response.data);
      alert("✅ Purchase saved successfully!");
    }
    
    // Navigate back to supplier ledger
    router.push(`/supplier-ledger/${form.value.supplier}`);
  } catch (err) {
    console.error("❌ Purchase save FAILED:", err);
    console.error("❌ Full error response:", err.response?.data);
    
    let errorMessage = "Failed to save purchase.\n\n";
    
    if (err.response?.data) {
      if (typeof err.response.data === 'object') {
        const errors = [];
        for (const [key, value] of Object.entries(err.response.data)) {
          if (key === 'items' && Array.isArray(value)) {
            // Handle nested item errors
            value.forEach((itemError, index) => {
              if (typeof itemError === 'object') {
                for (const [itemKey, itemValue] of Object.entries(itemError)) {
                  errors.push(`Item ${index + 1} - ${itemKey}: ${Array.isArray(itemValue) ? itemValue.join(', ') : itemValue}`);
                }
              } else {
                errors.push(`Item ${index + 1}: ${itemError}`);
              }
            });
          } else {
            errors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
          }
        }
        errorMessage += "Errors:\n" + errors.join('\n');
      } else {
        errorMessage += err.response.data;
      }
    } else {
      errorMessage += "Please check the console for details.";
    }
    
    alert(errorMessage);
  } finally {
    saving.value = false;
  }
}

// Initialize
onMounted(async () => {
  console.log("🚀 AddPurchase mounted");
  console.log("📋 Route query:", route.query);
  
  await fetchSuppliers();
  
  const editId = route.query.edit;
  if (editId) {
    console.log("🔄 Entering EDIT mode for purchase ID:", editId);
    isEditMode.value = true;
    purchaseId.value = editId;
    await loadPurchaseData();
  } else {
    console.log("➕ Entering ADD mode");
    isEditMode.value = false;
    
    const querySupplier = route.query.supplier;
    if (querySupplier) {
      form.value.supplier = Number(querySupplier);
    }
  }
});
</script>
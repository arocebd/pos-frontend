<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">
        {{ isEditMode ? '✏️ Edit Purchase' : '🧾 Add Purchase' }}
      </h2>
      <div class="flex gap-2">
        <button @click="goBack" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">← Back</button>
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
          <button @click="openQuickAddProduct" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">+ New Product</button>
        </div>

        <ul v-if="suggestions.length" class="mt-2 border rounded max-h-56 overflow-y-auto">
          <li
            v-for="p in suggestions"
            :key="p.id"
            @click="addItem(p)"
            class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between"
          >
            <div>
              <span>{{ p.title }} ({{ p.product_code }})</span>
              <span v-if="p.has_variants" class="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Has Variants</span>
            </div>
            <span class="text-gray-600">৳ {{ p.purchased_price || 0 }}</span>
          </li>
        </ul>
      </div>

      <!-- Variant Selection Modal -->
      <div v-if="showVariantModal" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           @click.self="showVariantModal = false">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold mb-4">Select Variant</h3>
          <p class="text-gray-600 mb-4">{{ selectedProduct?.title }}</p>
          
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div 
              v-for="variant in variants[selectedProduct?.id]" 
              :key="variant.id"
              @click="selectVariant(variant)"
              class="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition">
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-semibold">{{ variant.variant_name }}</p>
                  <p class="text-sm text-gray-500">Stock: {{ variant.stock }}</p>
                </div>
                <p class="font-bold text-blue-600">৳{{ variant.purchase_price || variant.selling_price || 0 }}</p>
              </div>
            </div>
          </div>

          <button @click="showVariantModal = false"
                  class="mt-4 w-full py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
            Cancel
          </button>
        </div>
      </div>

      <!-- Quick Add Product Modal -->
      <div v-if="showQuickAddProduct" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
           @click.self="showQuickAddProduct = false">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-2xl font-bold mb-4">➕ Quick Add Product</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-semibold mb-1">Product Title *</label>
              <input v-model="quickProduct.title" class="w-full border rounded p-2" placeholder="e.g., Rice 5kg bag" />
            </div>

            <!-- Product Code -->
            <div>
              <label class="block text-sm font-semibold mb-1">Product Code *</label>
              <input v-model="quickProduct.product_code" class="w-full border rounded p-2" placeholder="e.g., PROD001" />
            </div>

            <!-- Category -->
            <div class="md:col-span-2">
              <label class="block text-sm font-semibold mb-1">Category *</label>
              <div class="flex gap-2">
                <select v-model="quickProduct.category" class="border rounded p-2 flex-1">
                  <option :value="null" disabled>-- Select Category --</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
                <input v-model="newCat" placeholder="New category" class="border rounded p-2 w-32" />
                <button
                  class="px-3 py-2 rounded border hover:bg-gray-100 text-sm"
                  :disabled="addingCat || !newCat.trim()"
                  @click="addCategory"
                  type="button"
                >
                  {{ addingCat ? "Adding..." : "+ Add" }}
                </button>
              </div>
            </div>

            <!-- Base Unit -->
            <div>
              <label class="block text-sm font-semibold mb-1">Base Unit *</label>
              <select v-model="quickProduct.base_unit" class="w-full border rounded p-2">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="ltr">Liter (ltr)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
            </div>

            <!-- Purchase Price -->
            <div>
              <label class="block text-sm font-semibold mb-1">Purchase Price *</label>
              <input v-model.number="quickProduct.purchased_price" type="number" step="0.01" min="0" class="w-full border rounded p-2" placeholder="0.00" />
            </div>

            <!-- Regular Price -->
            <div>
              <label class="block text-sm font-semibold mb-1">Regular Price *</label>
              <input v-model.number="quickProduct.regular_price" type="number" step="0.01" min="0" class="w-full border rounded p-2" placeholder="0.00" />
            </div>

            <!-- Selling Price -->
            <div>
              <label class="block text-sm font-semibold mb-1">Selling Price</label>
              <input v-model.number="quickProduct.selling_price" type="number" step="0.01" min="0" class="w-full border rounded p-2" placeholder="0.00" />
            </div>

            <!-- SKU -->
            <div>
              <label class="block text-sm font-semibold mb-1">SKU (Optional)</label>
              <input v-model="quickProduct.sku" class="w-full border rounded p-2" placeholder="e.g., SKU123" />
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button @click="showQuickAddProduct = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">Cancel</button>
            <button @click="saveQuickProduct" :disabled="quickProductLoading" class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400">
              {{ quickProductLoading ? 'Creating...' : 'Create & Add to Purchase' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Items table -->
      <div class="bg-white rounded-lg shadow overflow-x-auto mb-4">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-3 py-2 text-left">#</th>
              <th class="px-3 py-2 text-left">Product/Variant</th>
              <th class="px-3 py-2 text-left">Pack Unit</th>
              <th class="px-3 py-2 text-right">Pack Size</th>
              <th class="px-3 py-2 text-right">Qty Packs</th>
              <th class="px-3 py-2 text-right">Price/Pack</th>
              <th class="px-3 py-2 text-left">Batch No</th>
              <th class="px-3 py-2 text-left">Expiry</th>
              <th class="px-3 py-2 text-right">MRP</th>
              <th class="px-3 py-2 text-right">Base Qty</th>
              <th class="px-3 py-2 text-right">Total (৳)</th>
              <th class="px-3 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in items" :key="row.pid + '_' + (row.vid || 0)" class="border-t">
              <td class="px-3 py-2">{{ i + 1 }}</td>
              <td class="px-3 py-2">
                <div class="font-medium">{{ row.title }}</div>
                <div v-if="row.variant_name" class="text-xs text-purple-600">{{ row.variant_name }}</div>
                <div class="text-xs text-gray-500">{{ row.base_unit }}</div>
              </td>
              <td class="px-3 py-2">
                <select v-model="row.pack_unit" class="border rounded p-1 text-xs w-20">
                  <option value="unit">Unit</option>
                  <option value="bag">Bag</option>
                  <option value="carton">Carton</option>
                  <option value="box">Box</option>
                  <option value="strip">Strip</option>
                  <option value="bottle">Bottle</option>
                  <option value="pack">Pack</option>
                </select>
              </td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0.001" step="0.001" v-model.number="row.pack_size" 
                       class="w-20 border rounded p-1 text-right text-xs" />
              </td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0.001" step="0.001" v-model.number="row.qty_packs" 
                       class="w-20 border rounded p-1 text-right text-xs" />
              </td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0" step="0.01" v-model.number="row.price_per_pack" 
                       class="w-24 border rounded p-1 text-right text-xs" />
              </td>
              <td class="px-3 py-2">
                <input type="text" v-model="row.batch_no" placeholder="Optional" 
                       class="w-24 border rounded p-1 text-xs" />
              </td>
              <td class="px-3 py-2">
                <input type="date" v-model="row.expiry_date" 
                       class="w-32 border rounded p-1 text-xs" />
              </td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0" step="0.01" v-model.number="row.mrp" placeholder="Optional"
                       class="w-20 border rounded p-1 text-right text-xs" />
              </td>
              <td class="px-3 py-2 text-right font-medium text-gray-700 text-xs">
                {{ (row.pack_size * row.qty_packs).toFixed(3) }}
              </td>
              <td class="px-3 py-2 text-right font-semibold">৳ {{ (row.price_per_pack * row.qty_packs).toFixed(2) }}</td>
              <td class="px-3 py-2 text-center">
                <button @click="removeItem(i)" class="text-red-600 hover:text-red-800 px-2 py-1">🗑️</button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="12" class="text-center py-6 text-gray-500">No items added.</td>
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
const variants = ref({});
const showVariantModal = ref(false);
const selectedProduct = ref(null);
const showQuickAddProduct = ref(false);
const quickProductLoading = ref(false);
const categories = ref([]);
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

const quickProduct = ref({
  title: "",
  product_code: "",
  sku: "",
  category: null,
  base_unit: "pcs",
  purchased_price: null,
  regular_price: null,
  selling_price: null,
});

const newCat = ref("");
const addingCat = ref(false);

const subtotal = computed(() =>
  items.value.reduce((s, r) => s + Number(r.qty_packs || 0) * Number(r.price_per_pack || 0), 0)
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

async function fetchCategories() {
  try {
    const res = await axios.get("/categories/");
    categories.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Failed to fetch categories:", err);
  }
}

async function addCategory() {
  if (!newCat.value.trim()) return;
  addingCat.value = true;
  try {
    const { data } = await axios.post("/categories/", { name: newCat.value.trim() });
    categories.value.unshift(data);
    quickProduct.value.category = data.id;
    newCat.value = "";
    console.log("✅ Category added:", data.name);
  } catch (err) {
    console.error("❌ Failed to add category", err);
    alert("❌ Failed to add category: " + (err.response?.data?.detail || err.message));
  } finally {
    addingCat.value = false;
  }
}

function openQuickAddProduct() {
  showQuickAddProduct.value = true;
  quickProduct.value = {
    title: "",
    product_code: "",
    sku: "",
    category: null,
    base_unit: "pcs",
    purchased_price: null,
    regular_price: null,
    selling_price: null,
  };
}

async function saveQuickProduct() {
  // Validation
  if (!quickProduct.value.title.trim()) {
    alert("⚠️ Please enter a product title");
    return;
  }
  if (!quickProduct.value.product_code.trim()) {
    alert("⚠️ Please enter a product code");
    return;
  }
  if (!quickProduct.value.category) {
    alert("⚠️ Please select a category");
    return;
  }
  if (!quickProduct.value.purchased_price) {
    alert("⚠️ Please enter purchase price");
    return;
  }
  if (!quickProduct.value.regular_price) {
    alert("⚠️ Please enter regular price");
    return;
  }

  quickProductLoading.value = true;

  try {
    // Create product
    const payload = {
      title: quickProduct.value.title.trim(),
      product_code: quickProduct.value.product_code.trim(),
      sku: quickProduct.value.sku?.trim() || null,
      category: quickProduct.value.category,
      base_unit: quickProduct.value.base_unit,
      purchased_price: Number(quickProduct.value.purchased_price).toFixed(2),
      regular_price: Number(quickProduct.value.regular_price).toFixed(2),
      selling_price: quickProduct.value.selling_price ? Number(quickProduct.value.selling_price).toFixed(2) : null,
      stock: 0, // Will be updated by purchase
    };

    console.log("💾 Creating quick product:", payload);
    
    const response = await axios.post("/products/", payload);
    const newProduct = response.data;
    
    console.log("✅ Product created:", newProduct);

    // Automatically add to purchase items
    items.value.push({
      pid: newProduct.id,
      vid: null,
      title: newProduct.title,
      variant_name: null,
      base_unit: newProduct.base_unit,
      pack_unit: 'unit',
      pack_size: 1,
      qty_packs: 1,
      price_per_pack: Number(newProduct.purchased_price || 0),
      batch_no: '',
      expiry_date: '',
      mrp: null,
    });

    alert("✅ Product created and added to purchase!");
    showQuickAddProduct.value = false;
    search.value = "";
    suggestions.value = [];
  } catch (error) {
    console.error("❌ Error creating product", error.response?.data || error);
    let errorMsg = "Failed to create product";
    
    if (error.response?.data) {
      if (typeof error.response.data === 'object') {
        const errors = [];
        for (const [key, value] of Object.entries(error.response.data)) {
          errors.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
        }
        errorMsg += ":\n" + errors.join('\n');
      } else {
        errorMsg += ": " + error.response.data;
      }
    }
    
    alert("❌ " + errorMsg);
  } finally {
    quickProductLoading.value = false;
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
        pid: item.product || null,
        vid: item.product_variant || null,
        title: item.product_title || 'Unknown',
        variant_name: item.variant_name || null,
        base_unit: 'pcs',
        pack_unit: item.pack_unit || 'unit',
        pack_size: Number(item.pack_size || 1),
        qty_packs: Number(item.qty_packs || 1),
        price_per_pack: Number(item.price_per_pack || 0),
        batch_no: item.batch_no || '',
        expiry_date: item.expiry_date || '',
        mrp: item.mrp || null,
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

async function addItem(p, variant = null) {
  // Check if product has variants
  if (p.has_variants && !variant) {
    // Load variants and show modal
    await loadVariants(p.id);
    selectedProduct.value = p;
    showVariantModal.value = true;
    return;
  }
  
  const key = variant ? `${p.id}_${variant.id}` : p.id;
  const exists = items.value.find(x => x.pid === p.id && x.vid === (variant?.id || null));
  if (exists) { 
    exists.qty_packs += 1; 
    return; 
  }
  
  items.value.push({
    pid: p.id,
    vid: variant?.id || null,
    title: p.title,
    variant_name: variant?.variant_name || null,
    base_unit: p.base_unit || 'pcs',
    pack_unit: 'unit',
    pack_size: 1,
    qty_packs: 1,
    price_per_pack: Number(variant?.purchase_price || p.purchased_price || 0),
    batch_no: '',
    expiry_date: '',
    mrp: null,
  });
  search.value = "";
  suggestions.value = [];
  showVariantModal.value = false;
}

async function loadVariants(productId) {
  try {
    const res = await axios.get(`/product-variants/?product=${productId}`);
    variants.value[productId] = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Failed to load variants:", err);
  }
}

function selectVariant(variant) {
  addItem(selectedProduct.value, variant);
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
    // Prepare items in the new format with pack-based purchasing
    const itemsPayload = items.value.map(r => ({
      product: r.vid ? null : r.pid,
      product_variant: r.vid || null,
      pack_unit: r.pack_unit || 'unit',
      pack_size: parseFloat(Number(r.pack_size || 1).toFixed(3)),
      qty_packs: parseFloat(Number(r.qty_packs || 1).toFixed(3)),
      price_per_pack: parseFloat(Number(r.price_per_pack || 0).toFixed(2)),
      batch_no: r.batch_no || null,
      expiry_date: r.expiry_date || null,
      mrp: r.mrp ? parseFloat(Number(r.mrp).toFixed(2)) : null,
    }));

    // Prepare the main payload
    const payload = {
      supplier: Number(form.value.supplier),
      invoice_no: form.value.invoice_no.trim(),
      date: form.value.date,
      discount: parseFloat(Number(form.value.discount || 0).toFixed(2)),
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
      
      // If paid_amount > 0, create a payment entry in supplier ledger
      if (payload.paid_amount > 0) {
        try {
          console.log("💰 Creating payment entry for paid amount:", payload.paid_amount);
          const paymentPayload = {
            supplier: Number(form.value.supplier),
            amount: payload.paid_amount,
            payment_method: payload.payment_method,
            memo_no: `INV-${payload.invoice_no}`,
            remarks: `Payment for invoice ${payload.invoice_no}`,
          };
          
          await axios.post("/supplier-payments/", paymentPayload);
          console.log("✅ Payment entry created successfully");
        } catch (paymentErr) {
          console.error("❌ Failed to create payment entry:", paymentErr);
          // Don't fail the entire purchase, just log the error
          alert("⚠️ Purchase saved but payment ledger entry failed. Please add payment manually in supplier ledger.");
        }
      }
      
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
  await fetchCategories();
  
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
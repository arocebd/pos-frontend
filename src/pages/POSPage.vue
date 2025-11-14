<template>
  <div class="max-w-7xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6 text-center">Point of Sale</h2>

    <!-- Customer Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow mb-6">
      <div>
        <label class="block text-sm font-semibold">Customer Name *</label>
        <input 
          v-model="customer.name" 
          class="w-full border rounded p-2" 
          placeholder="Customer Name" 
          :disabled="saleCompleted"
        />
      </div>
      <div class="relative">
        <label class="block text-sm font-semibold">Phone *</label>
        <div class="flex gap-2">
          <input
            v-model="customer.phone"
            @input="searchCustomers"
            @focus="searchCustomers"
            class="w-full border rounded p-2"
            placeholder="Phone Number"
            ref="phoneInput"
            :disabled="saleCompleted"
          />
          <button 
            @click="fetchCustomerByPhone" 
            class="bg-gray-500 text-white px-3 rounded hover:bg-gray-600"
            :disabled="saleCompleted"
          >
            🔍
          </button>
        </div>
        
        <!-- Customer Search Results Dropdown -->
        <div v-if="customerSuggestions.length > 0 && !customer.phone" class="absolute z-50 bg-white border rounded-lg shadow w-full mt-1 max-h-40 overflow-y-auto">
          <div 
            v-for="cust in customerSuggestions" 
            :key="cust.id"
            @click="selectCustomer(cust)"
            @mousedown.prevent 
            class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
          >
            <div class="flex justify-between items-start">
              <div>
                <span class="font-medium text-gray-800">{{ cust.name }}</span>
                <div class="text-sm text-gray-600">{{ cust.phone }}</div>
              </div>
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ⭐ {{ cust.points }} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Points Info -->
      <div v-if="customer.points > 0" class="col-span-2">
        <div class="bg-green-50 border border-green-200 rounded p-3">
          <div class="flex justify-between items-center">
            <div>
              <span class="text-green-700 font-semibold">⭐ Existing Customer</span>
              <p class="text-sm text-green-600">Available Points: <strong>{{ customer.points }}</strong></p>
            </div>
            <button 
              v-if="customer.points > 0 && totalBeforePoints > 0 && !saleCompleted"
              @click="applyMaxPoints"
              class="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Use Max Points
            </button>
          </div>
        </div>
      </div>
      
      <!-- New Customer Indicator -->
      <div v-else-if="customer.phone && customer.name" class="col-span-2">
        <div class="bg-blue-50 border border-blue-200 rounded p-3">
          <span class="text-blue-700 font-semibold">🆕 New Customer</span>
          <p class="text-sm text-blue-600">This customer will be created automatically on checkout</p>
        </div>
      </div>
    </div>

    <!-- Sale Completed Success Message -->
    <div v-if="saleCompleted" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-green-600 text-2xl mr-3">✅</span>
          <div>
            <h3 class="font-semibold text-green-800">Sale Completed Successfully!</h3>
            <p class="text-sm text-green-600">Invoice #{{ lastSaleId }} | Total: ৳{{ lastSaleTotal }}</p>
          </div>
        </div>
        <button 
          @click="startNewSale"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          New Sale
        </button>
      </div>
    </div>

    <!-- Search / Scan -->
    <div class="relative mb-6">
      <div class="flex gap-2">
        <input
          v-model="barcodeInput"
          @input="searchProducts"
          @keyup.enter="addProductByCode" 
          placeholder="Enter or scan product code / barcode / name..."
          class="flex-1 border p-3 rounded-lg"
          :disabled="!customer.name || !customer.phone || saleCompleted"
        />
        <button
          @click="addProductByCode"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          :disabled="!customer.name || !customer.phone || saleCompleted"
        >
          Add
        </button>
      </div>

      <!-- Product Suggestion Dropdown -->
      <ul
        v-if="suggestions.length"
        class="absolute z-10 bg-white border rounded-lg shadow w-full mt-1 max-h-56 overflow-y-auto"
      >
        <li
          v-for="item in suggestions"
          :key="item.id"
          @click="selectSuggestion(item)"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
        >
          <span>{{ item.title }} ({{ item.product_code }})</span>
          <span class="text-gray-600">৳ {{ item.selling_price || item.regular_price }}</span>
        </li>
      </ul>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <p>Loading products...</p>
    </div>

    <!-- Cart Table -->
    <div v-if="cart.length > 0" class="overflow-x-auto bg-white rounded-xl shadow mb-6">
      <table class="w-full text-sm text-gray-700">
        <thead class="bg-gray-100 text-gray-800 uppercase text-xs">
          <tr>
            <th class="px-3 py-2 text-left">#</th>
            <th class="px-3 py-2 text-left">Product</th>
            <th class="px-3 py-2 text-center">Qty</th>
            <th class="px-3 py-2 text-right">Price</th>
            <th class="px-3 py-2 text-right">Total</th>
            <th class="px-3 py-2 text-center">❌</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cart" :key="index" class="border-t">
            <td class="px-3 py-2">{{ index + 1 }}</td>
            <td class="px-3 py-2">{{ item.title }}</td>
            <td class="px-3 py-2 text-center">
              <input 
                type="number" 
                v-model.number="item.quantity" 
                min="1" 
                class="w-16 border rounded text-center" 
                :disabled="saleCompleted"
              />
            </td>
            <td class="px-3 py-2 text-right">৳ {{ item.price.toFixed(2) }}</td>
            <td class="px-3 py-2 text-right">৳ {{ (item.price * item.quantity).toFixed(2) }}</td>
            <td class="px-3 py-2 text-center">
              <button 
                @click="removeItem(index)" 
                class="text-red-500 hover:text-red-700"
                :disabled="saleCompleted"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty Cart State -->
    <div v-if="cart.length === 0 && !saleCompleted" class="bg-white rounded-xl shadow p-8 text-center mb-6">
      <div class="text-gray-400 text-6xl mb-4">🛒</div>
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
      <p class="text-gray-500">Add products to get started</p>
    </div>

    <!-- Totals -->
    <div v-if="cart.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2"></div>
      <div class="bg-white rounded-xl shadow p-4 space-y-3">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <strong>৳ {{ subtotal.toFixed(2) }}</strong>
        </div>
        
        <div class="flex justify-between items-center">
          <span>Discount (৳):</span>
          <input 
            type="number" 
            v-model.number="discount" 
            min="0"
            :max="subtotal"
            class="w-24 text-right border rounded p-1" 
            :disabled="saleCompleted"
          />
        </div>

        <!-- Points Redemption -->
        <div v-if="customer.points > 0" class="border-t pt-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-semibold">Redeem Points:</span>
            <div class="flex items-center gap-2">
              <input
                type="number"
                v-model.number="redeemPoints"
                :max="Math.min(customer.points, totalBeforePoints)"
                min="0"
                class="w-20 text-right border rounded p-1"
                :disabled="saleCompleted"
              />
              <button 
                @click="applyMaxPoints"
                class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                :disabled="saleCompleted"
              >
                Max
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 text-right">
            Available: {{ customer.points }} pts (৳{{ customer.points }})
          </p>
        </div>

        <div class="border-t pt-2">
          <div class="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>৳ {{ finalTotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm text-gray-600 mt-1">
            <span>Points Earned:</span>
            <span class="text-green-600">+{{ pointsEarned }} pts</span>
          </div>
          <div v-if="redeemPoints > 0" class="flex justify-between text-sm text-red-600">
            <span>Points Redeemed:</span>
            <span>-{{ redeemPoints }} pts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div v-if="cart.length > 0 && !saleCompleted" class="flex justify-end gap-3 mt-6">
      <button @click="clearCart" class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Clear Cart</button>
      <button @click="printInvoice" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Print Preview</button>
      <button @click="checkout" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Checkout (৳{{ finalTotal.toFixed(2) }})
      </button>
    </div>

    <!-- Action Buttons After Sale Completion -->
    <div v-if="saleCompleted" class="flex justify-end gap-3 mt-6">
      <button @click="editSale" class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">Edit</button>
      <button @click="printInvoice" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Print Invoice</button>
      <button @click="clearCart" class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Clear</button>
      <button @click="startNewSale" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">New Sale</button>
    </div>

    <!-- All Products Grid -->
    <div class="mt-10" v-if="!saleCompleted">
      <h3 class="text-xl font-semibold mb-4">All Products</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="p in allProducts"
          :key="p.id"
          class="border rounded-xl p-3 hover:shadow-lg cursor-pointer transition"
          @click="addToCart(p)"
          :class="{ 'opacity-50': !customer.name || !customer.phone }"
        >
          <img
            v-if="p.image_url"
            :src="p.image_url"
            alt="Product"
            class="w-full h-32 object-cover rounded-md mb-2"
          />
          <div v-else class="w-full h-32 bg-gray-200 rounded-md mb-2 flex items-center justify-center">
            <span class="text-gray-500">No Image</span>
          </div>
          <h4 class="font-semibold text-sm truncate">{{ p.title }}</h4>
          <p class="text-gray-600 text-xs">{{ p.product_code }}</p>
          <p class="font-bold text-blue-600 text-sm">৳ {{ p.selling_price || p.regular_price }}</p>
        </div>
      </div>
    </div>

   <!-- Hidden Print Area -->
<div id="print-area" class="hidden">
  <div class="invoice-container">
    <!-- Header -->
    <div class="text-center mb-2">
      <h1 class="text-base font-bold">Al Zabeer</h1>
      <p class="text-xs">Town Chikandi Bazar,</p>
      <p class="text-xs">Shariatpur Shadar, Shariatpur</p>
      <p class="text-xs">Phone: 01791927084</p>
      <p class="text-xs">Website: alzabeer.store</p>
    </div>

    <!-- Invoice Info -->
    <div class="text-xs mb-2">
      <p>Invoice #: {{ lastSaleId || 'DRAFT' }}</p>
      <p>Date: {{ new Date().toLocaleString() }}</p>
      <p>Customer: {{ customer.name }}</p>
      <p>Phone: {{ customer.phone }}</p>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in cart" :key="index">
          <td>{{ item.title }}</td>
          <td>{{ item.quantity }}</td>
          <td>৳{{ item.price.toFixed(2) }}</td>
          <td>৳{{ (item.price * item.quantity).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="flex justify-between">
        <span>Subtotal:</span>
        <span>৳{{ subtotal.toFixed(2) }}</span>
      </div>
      <div v-if="discount > 0" class="flex justify-between">
        <span>Discount:</span>
        <span>৳{{ discount.toFixed(2) }}</span>
      </div>
      <div v-if="redeemPoints > 0" class="flex justify-between">
        <span>Points Redeemed:</span>
        <span>-{{ redeemPoints }} pts</span>
      </div>
      <div class="flex justify-between font-bold total-line">
        <span>Total:</span>
        <span>৳{{ finalTotal.toFixed(2) }}</span>
      </div>
      
      <!-- Compact Points Information -->
      <div class="points-info border-t border-dashed mt-2 pt-2">
        <div class="flex justify-between text-xs">
          <span>Points:</span>
          <span>
            <span v-if="customer.points > 0">{{ customer.points }} → </span>
            <span>{{ totalPointsAfterSale }} pts</span>
            <span v-if="pointsEarned > 0" class="text-green-600"> (+{{ pointsEarned }})</span>
            <span v-if="redeemPoints > 0" class="text-red-600"> (-{{ redeemPoints }})</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-xs mt-4">
      <p>Thank you for shopping!</p>
      <p>Visit Again</p>
    </div>
        <!-- Cut line -->
        <div class="cut-line text-center mt-4">-------------------------------</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "../axios";

const customer = ref({ name: "", phone: "", points: 0 });
const cart = ref([]);
const barcodeInput = ref("");
const discount = ref(0);
const redeemPoints = ref(0);
const suggestions = ref([]);
const customerSuggestions = ref([]);
const allProducts = ref([]);
const loading = ref(false);
const phoneInput = ref(null);
const saleCompleted = ref(false);
const lastSaleId = ref(null);
const lastSaleTotal = ref(0);

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0));
const totalBeforePoints = computed(() => Math.max(0, subtotal.value - discount.value));
const finalTotal = computed(() => Math.max(0, totalBeforePoints.value - redeemPoints.value));
const pointsEarned = computed(() => Math.floor(finalTotal.value / 100));
const totalPointsAfterSale = computed(() => {
  return customer.value.points - redeemPoints.value + pointsEarned.value;
});

// 🧩 Search customers by phone
async function searchCustomers() {
  const phone = customer.value.phone.trim();
  
  if (!phone || phone.length < 3) {
    customerSuggestions.value = [];
    return;
  }
  
  try {
    const res = await axios.get(`/customers/?search=${phone}`);
    customerSuggestions.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Customer search error:", err);
    customerSuggestions.value = [];
  }
}

// 🧩 Select customer from search results
function selectCustomer(cust) {
  customer.value.name = cust.name;
  customer.value.phone = cust.phone;
  customer.value.points = cust.points;
  customerSuggestions.value = [];
}

// 🧩 Fetch customer by phone
async function fetchCustomerByPhone() {
  const phone = customer.value.phone.trim();
  
  if (!phone) {
    customer.value.name = "";
    customer.value.points = 0;
    return;
  }
  
  try {
    const res = await axios.get(`/customer-lookup/?phone=${phone}`);
    
    if (res.data && !res.data.error && !res.data.message) {
      customer.value.name = res.data.name;
      customer.value.points = res.data.points;
    }
  } catch (err) {
    if (err.response?.status === 404) {
      // New customer - expected
    } else {
      console.error("❌ Customer lookup error:", err);
    }
  }
}

// 🧩 Apply maximum redeemable points
function applyMaxPoints() {
  const maxRedeemable = Math.min(customer.value.points, totalBeforePoints.value);
  redeemPoints.value = maxRedeemable;
}

// Fetch all products
onMounted(async () => {
  await fetchAllProducts();
});

// Fetch all products with error handling
async function fetchAllProducts() {
  loading.value = true;
  try {
    const res = await axios.get("/products/");
    allProducts.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    alert("Failed to load products. Check if backend is running.");
  } finally {
    loading.value = false;
  }
}

// Product search
async function searchProducts() {
  if (!barcodeInput.value.trim()) {
    suggestions.value = [];
    return;
  }
  try {
    const res = await axios.get(`/products/?search=${barcodeInput.value}`);
    suggestions.value = res.data.results || res.data;
  } catch (err) {
    console.error("❌ Search error:", err);
    suggestions.value = [];
  }
}

// Select suggestion from dropdown
function selectSuggestion(item) {
  addToCart(item);
  barcodeInput.value = "";
  suggestions.value = [];
}

// Add product by code/barcode
async function addProductByCode() {
  if (!barcodeInput.value.trim()) return;
  if (!customer.value.name || !customer.value.phone) {
    alert("Please enter customer details first!");
    return;
  }
  
  try {
    const res = await axios.get(`/product-lookup/?code=${barcodeInput.value}`);
    if (!res.data || res.data.error) {
      alert("❌ Product not found!");
      return;
    }
    addToCart(res.data);
    barcodeInput.value = "";
    suggestions.value = [];
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    alert("❌ Product not found!");
  }
}

// Add product to cart
function addToCart(product) {
  if (!customer.value.name || !customer.value.phone) {
    alert("Please enter customer details first!");
    return;
  }
  
  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({
      id: product.id,
      title: product.title,
      price: parseFloat(product.selling_price || product.regular_price || 0),
      quantity: 1,
    });
  }
}

// Cart actions
function removeItem(index) {
  cart.value.splice(index, 1);
}

function clearCart() {
  cart.value = [];
  discount.value = 0;
  redeemPoints.value = 0;
  saleCompleted.value = false;
  lastSaleId.value = null;
  lastSaleTotal.value = 0;
}

// Print invoice function
function printInvoice() {
  if (cart.value.length === 0) {
    alert("Cart is empty! Add products to print invoice.");
    return;
  }

  const printArea = document.getElementById('print-area');
  const originalContents = document.body.innerHTML;
  
  
  // Show print area and hide everything else
  document.body.innerHTML = printArea.innerHTML;
  
  // Add print styles
  const style = document.createElement('style');
  style.innerHTML = `
    body { 
      margin: 0; 
      padding: 0; 
      font-family: "Courier New", monospace;
      width: 54mm;
    }
    .invoice-container {
      width: 54mm;
      margin: 0;
      padding: 2mm;
      font-size: 12px;
      line-height: 1.3;
      color: #000;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
    }
    .items-table th,
    .items-table td {
      font-size: 12px;
      padding: 2px 0;
      border-bottom: 1px dashed #000;
      color: #000 !important;
    }
    .items-table th {
      font-weight: bold;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .totals-section {
      font-size: 12px;
      margin-top: 4px;
      border-top: 1px solid #000;
      padding-top: 4px;
    }
    .total-line {
      font-size: 13px;
      font-weight: bold;
      margin-top: 4px;
    }
    .cut-line {
      font-size: 12px;
      margin-top: 8px;
    }
    @media print {
      body {
        width: 54mm;
        margin: 0;
        padding: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  window.print();
  
  // Restore original content
  document.body.innerHTML = originalContents;
  window.location.reload(); // Refresh to restore Vue functionality
}

// Edit sale (enable editing)
function editSale() {
  saleCompleted.value = false;
}

// Start new sale
function startNewSale() {
  clearCart();
  customer.value = { name: "", phone: "", points: 0 };
  saleCompleted.value = false;
  lastSaleId.value = null;
  lastSaleTotal.value = 0;
}

// Checkout function
async function checkout() {
  if (!customer.value.name || !customer.value.phone) {
    alert("Please enter customer details!");
    return;
  }
  
  if (!cart.value.length) {
    alert("Cart is empty!");
    return;
  }

  // Validate quantities
  for (const item of cart.value) {
    if (item.quantity < 1) {
      alert("Please set valid quantities for all products!");
      return;
    }
  }

  try {
    const payload = {
      customer_data: {
        name: customer.value.name.trim(),
        phone: customer.value.phone.trim()
      },
      subtotal: parseFloat(subtotal.value),
      discount: parseFloat(discount.value),
      total: parseFloat(finalTotal.value),
      redeemed_points: parseInt(redeemPoints.value),
      items: cart.value.map((item) => ({
        product: parseInt(item.id),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total: parseFloat(item.price * item.quantity),
      })),
    };

    console.log("📦 Checkout Payload:", payload);
    
    const res = await axios.post("/sales/", payload);
    console.log("✅ Checkout Response:", res.data);
    
    if (res.data.success) {
      const sale = res.data.data;
      
      // Set sale completion state
      saleCompleted.value = true;
      lastSaleId.value = sale.id;
      lastSaleTotal.value = finalTotal.value.toFixed(2);
      sale.items?.forEach(it => {
        const p = allProducts.value.find(x => x.id === it.product);
        if (p) p.stock -= it.quantity;
      });
      
      let message = `✅ Sale Completed!\nInvoice #${sale.id}\nTotal: ৳${finalTotal.value.toFixed(2)}`;
      
      if (redeemPoints.value > 0) {
        message += `\nRedeemed: ${redeemPoints.value} points`;
      }
      
      if (sale.earned_points > 0) {
        message += `\nEarned: +${sale.earned_points} points`;
      }
      
      if (sale.customer) {
        message += `\nCustomer Points: ${sale.customer.points} points`;
      }
      
      alert(message);
      
      // Update customer points if returned in response
      if (sale.customer && sale.customer.points !== undefined) {
        customer.value.points = sale.customer.points;
      }
    } else {
      console.error("❌ Checkout failed:", res.data);
      alert("Checkout failed: " + JSON.stringify(res.data.errors || res.data.error));
    }
  } catch (err) {
    console.error("❌ Checkout Error:", err);
    
    if (err.response) {
      if (err.response.data?.errors) {
        alert("Checkout failed: " + JSON.stringify(err.response.data.errors));
      } else if (err.response.data?.error) {
        alert("Checkout failed: " + err.response.data.error);
      } else {
        alert("Checkout failed! Please check the console for details.");
      }
    } else if (err.request) {
      alert("Network error! Please check if the backend server is running.");
    } else {
      alert("Checkout failed: " + err.message);
    }
  }
}
</script>

<style>
/* Add the print styles to the main component */
.hidden {
  display: none;
}

/* Print styles for the invoice */
@media print {
  body * {
    visibility: hidden;
  }
  #print-area,
  #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 54mm;
    margin: 0;
    padding: 0;
  }
}
</style>
<template>
  <div class="invoice-container">
    <!-- Header -->
    <div class="text-center mb-2">
      <h1 class="text-base font-bold">{{ shop_name }}</h1>
      <p class="text-xs">{{ location || 'No Address' }}</p>
      <p class="text-xs">Phone: {{ phone }}</p>
      <p class="text-xs">{{ email_or_link || 'No Website' }}</p>
    </div>

    <!-- Invoice Info -->
    <div class="text-xs mb-2">
      <p>Invoice #: {{ invoice.id }}</p>
      <p>Date: {{ new Date().toLocaleString() }}</p>
    </div>

    <table>
  <thead>
    <tr>
      <th>Item</th>
      <th>Qty</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in invoice.items" :key="item.id">
        <td>{{ item.product_name }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.price }}</td>
        <td>{{ item.total }}</td>
    </tr>
  </tbody>
</table>

    <!-- Totals -->
    <div class="totals-section">
      <div class="flex justify-between">
        <span>Subtotal:</span>
        <span>৳{{ invoice.subtotal }}</span>
      </div>
      <div class="flex justify-between">
        <span>Discount:</span>
        <span>{{ invoice.discount }}%</span>
      </div>
      <div class="flex justify-between font-bold total-line">
        <span>Total:</span>
        <span>৳{{ invoice.total }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-center text-xs mt-4">
      <p>Thank you for shopping!</p>
      <p>Visit Again</p>
    </div>

    <!-- Cut line -->
    <div class="cut-line text-center mt-4">-------------------------------</div>

    <!-- Print Button -->
    <div class="no-print mt-4 text-center">
      <button
        class="bg-green-600 text-white px-4 py-2 rounded"
        @click="printInvoice"
      >
        Print Invoice
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from "@/axios"

const route = useRoute()
const invoice = ref({ items: [] })

// Shop Info
const shop_name = ref('')
const location = ref('')
const phone = ref('')
const email_or_link = ref('')

onMounted(async () => {
  const res = await axios.get(`/sales/${route.params.id}/`)
  invoice.value = res.data
  
  // Load shop info from API
  try {
    const shopRes = await axios.get("/user/profile/")
    if (shopRes.data && shopRes.data.shop) {
      const shopData = shopRes.data.shop
      shop_name.value = shopData.shop_name || 'POS'
      location.value = shopData.location || ''
      phone.value = shopData.phone || ''
      email_or_link.value = shopData.email_or_link || ''
      console.log('Shop data loaded:', { shop_name: shop_name.value, location: location.value, phone: phone.value, email_or_link: email_or_link.value })
    }
  } catch (e) {
    console.error('Error loading shop data:', e)
  }
})

function printInvoice() {
  window.print()
}
</script>

<style>
.invoice-container {
  font-family: "Courier New", monospace;
  width: 54mm;   /* ✅ slightly smaller than 58mm roll for safe margins */
  margin: auto;
  padding: 2mm;
  font-size: 12px;
  line-height: 1.3;
  color: #000;
}

/* Items Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px;
}

.items-table th,
.items-table td {
  font-size: 12px;
  padding: 2px 0;
  border-bottom: 1px dashed #000; /* ✅ dashed separator like receipts */
  color: #000 !important;        /* ✅ force black for printing */
}

.items-table th {
  font-weight: bold;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}

/* Totals Section */
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

/* Cut line */
.cut-line {
  font-size: 12px;
  margin-top: 8px;
}

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  .invoice-container,
  .invoice-container * {
    visibility: visible;
  }
  .invoice-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 54mm;   /* ✅ safe for 58mm roll */
    margin: 0;
    padding: 0;
    font-size: 12px;
    line-height: 1.3;
  }
  .no-print {
    display: none !important;
  }
}
</style>

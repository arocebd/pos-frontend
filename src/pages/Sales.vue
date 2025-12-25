<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">Sales Records</h2>

    <table class="w-full border-collapse border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">Invoice #</th>
          <th class="border p-2">Customer</th>
          <th class="border p-2">Date</th>
          <th class="border p-2">Total</th>
          <th class="border p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in sales" :key="sale.id">
          <td class="border p-2 text-center">#{{ sale.id }}</td>
          <td class="border p-2">{{ sale.customer?.name || 'Walk-in' }}</td>
          <td class="border p-2">{{ formatDate(sale.date) }}</td>
          <td class="border p-2 text-right">{{ sale.total }} ৳</td>
          <td class="border p-2 text-center">
            <button
              @click="viewInvoice(sale.id)"
              class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🧾 Invoice Modal -->
    <div v-if="selectedInvoice" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg w-[400px] shadow-lg">
        <!-- Preview of invoice -->
        <div class="text-center mb-4 border-b pb-2">
          <h2 class="text-xl font-bold">🏪 {{ shop_name }}</h2>
          <p class="text-sm">Invoice: #{{ selectedInvoice.id }}</p>
          <p class="text-sm">Date: {{ formatDate(selectedInvoice.date) }}</p>
          <p class="text-sm">Customer: {{ selectedInvoice.customer?.name || 'Walk-in' }}</p>
        </div>

        <div class="max-h-60 overflow-y-auto mb-3">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-1">Item</th>
                <th class="text-center py-1">Qty</th>
                <th class="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedInvoice.items" :key="item.id" class="border-b">
                <td class="py-1">{{ getProductName(item.product) }}</td>
                <td class="text-center py-1">{{ item.quantity }}</td>
                <td class="text-right py-1">{{ formatNumber(item.total) }} ৳</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="text-right text-sm border-t pt-2">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>{{ formatNumber(selectedInvoice.subtotal) }} ৳</span>
          </div>
          <div class="flex justify-between">
            <span>Discount:</span>
            <span>{{ formatNumber(selectedInvoice.discount) }} ৳</span>
          </div>
          <div class="flex justify-between font-bold text-lg mt-1">
            <span>TOTAL:</span>
            <span>{{ formatNumber(selectedInvoice.total) }} ৳</span>
          </div>
          
          <!-- Points Preview -->
          <div v-if="selectedInvoice.customer" class="border-t border-dashed mt-2 pt-2 text-xs">
            <div class="flex justify-between">
              <span>Points Earned:</span>
              <span class="text-green-600">+{{ calculatePointsEarned() }}</span>
            </div>
            <div v-if="selectedInvoice.redeem_points > 0" class="flex justify-between">
              <span>Points Redeemed:</span>
              <span class="text-red-600">-{{ selectedInvoice.redeem_points }}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span>Total Points:</span>
              <span>{{ calculateTotalPoints() }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
          <button 
            @click="printReceipt" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            🖨️ Print Receipt
          </button>
          <button 
            @click="selectedInvoice = null" 
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "@/axios";

// Reactive state
const shop_name = ref('');
const location = ref('');
const phone = ref('');
const email_or_link = ref('');

const sales = ref([]);
const selectedInvoice = ref(null);
const products = ref([]);

// On mount: load sales, products, and shop info
onMounted(async () => {
  try {
    const [salesRes, productsRes] = await Promise.all([
      axios.get("sales/"),
      axios.get("products/")
    ]);
    sales.value = salesRes.data;
    products.value = productsRes.data;
  } catch (error) {
    console.error("Error loading data:", error);
  }

  try {
    const shop = JSON.parse(localStorage.getItem('shop') || '{}');
    shop_name.value = shop.shop_name || 'POS';
    location.value = shop.location || '';
    phone.value = shop.phone || '';
    email_or_link.value = shop.email_or_link || '';
  } catch (e) {
    console.warn("Invalid shop data in localStorage");
  }
});

// Formatting
const formatDate = (d) => new Date(d).toLocaleString();

const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

const getProductName = (productId) => {
  const product = products.value.find(p => p.id === productId);
  return product ? product.title : 'Unknown Product';
};

// Points calculation
const calculatePointsEarned = () => {
  if (!selectedInvoice.value) return 0;
  const total = safeNumber(selectedInvoice.value.total);
  return Math.floor(total / 100);
};

const calculateTotalPoints = () => {
  if (!selectedInvoice.value || !selectedInvoice.value.customer) return 0;
  const currentPoints = safeNumber(selectedInvoice.value.customer.points || 0);
  const pointsEarned = calculatePointsEarned();
  const pointsRedeemed = safeNumber(selectedInvoice.value.redeem_points || 0);
  return currentPoints + pointsEarned - pointsRedeemed;
};

// Load invoice by ID
const viewInvoice = async (id) => {
  try {
    const res = await axios.get(`/invoice/${id}/`);
    selectedInvoice.value = res.data;
    console.log("Invoice loaded:", selectedInvoice.value);
  } catch (error) {
    console.error("Error loading invoice:", error);
    alert("Error loading invoice details");
  }
};

// Print receipt
const printReceipt = () => {
  if (!selectedInvoice.value) {
    alert("No invoice selected");
    return;
  }

  const currentPoints = safeNumber(selectedInvoice.value.customer?.points || 0);
  const pointsEarned = calculatePointsEarned();
  const pointsRedeemed = safeNumber(selectedInvoice.value.redeem_points || 0);
  const totalPoints = calculateTotalPoints();

  const shopInfo = {
    shop_name: shop_name.value,
    location: location.value,
    phone: phone.value,
    email_or_link: email_or_link.value,
  };

  const receiptContent = generateReceiptContent(
    selectedInvoice.value,
    products.value,
    currentPoints,
    pointsEarned,
    pointsRedeemed,
    totalPoints,
    shopInfo
  );

  // Create a hidden iframe and print
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(receiptContent);
    iframeDoc.close();

    iframe.onload = function () {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  } catch (error) {
    console.error("Print error:", error);
    alert("Print failed: " + error.message);
  }
};

// Generate receipt HTML
const generateReceiptContent = (invoice, products, currentPoints, pointsEarned, pointsRedeemed, totalPoints, shopInfo) => {
  const { shop_name, location, phone, email_or_link } = shopInfo;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${invoice.id}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 280px;
          margin: 0 auto;
          padding: 15px;
          line-height: 1.3;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .font-bold { font-weight: bold; }
        .border-t { border-top: 1px solid #000; }
        .border-dashed { border-style: dashed; }
        .mt-2 { margin-top: 8px; }
        .mt-4 { margin-top: 16px; }
        .pt-2 { padding-top: 8px; }
        .mb-2 { margin-bottom: 8px; }
        .text-green { color: #16a34a; }
        .text-red { color: #dc2626; }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }

        .items-table th,
        .items-table td {
          padding: 3px 0;
          border-bottom: 1px dashed #ccc;
        }

        .items-table th {
          border-bottom: 1px solid #000;
        }
      </style>
    </head>
    <body>
      <div class="text-center mb-2">
        <h1 class="font-bold" style="font-size: 14px;">${shop_name}</h1>
        <p>${location}</p>
        <p>Phone: ${phone}</p>
        <p>${email_or_link}</p>
      </div>

      <div class="mb-2">
        <p>Invoice #: ${invoice.id}</p>
        <p>Date: ${formatDate(invoice.date)}</p>
        <p>Customer: ${invoice.customer?.name || 'Walk-in'}</p>
        <p>Phone: ${invoice.customer?.phone || 'N/A'}</p>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th class="text-left">Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => {
            const product = products.find(p => p.id === item.product);
            const name = product ? product.title : "Unknown";
            const total = safeNumber(item.total);
            const qty = safeNumber(item.quantity);
            const price = qty > 0 ? (total / qty) : 0;
            return `
              <tr>
                <td>${name}</td>
                <td class="text-center">${qty}</td>
                <td class="text-right">৳${price.toFixed(2)}</td>
                <td class="text-right">৳${total.toFixed(2)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="mt-2">
        <div class="flex justify-between">
          <span>Subtotal:</span><span>৳${safeNumber(invoice.subtotal).toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span>Discount:</span><span>৳${safeNumber(invoice.discount).toFixed(2)}</span>
        </div>
        <div class="flex justify-between font-bold border-t pt-2 mt-2">
          <span>Total:</span><span>৳${safeNumber(invoice.total).toFixed(2)}</span>
        </div>
      </div>

      ${invoice.customer ? `
        <div class="mt-2 pt-2 border-t border-dashed text-xs">
          <div class="flex justify-between">
            <span>Previous Points:</span><span>${currentPoints}</span>
          </div>
          <div class="flex justify-between">
            <span>Earned:</span><span class="text-green">+${pointsEarned}</span>
          </div>
          ${pointsRedeemed > 0 ? `
            <div class="flex justify-between">
              <span>Redeemed:</span><span class="text-red">-${pointsRedeemed}</span>
            </div>` : ``}
          <div class="flex justify-between font-bold border-t mt-1 pt-1">
            <span>Total Points:</span><span>${totalPoints}</span>
          </div>
        </div>
      ` : ''}

      <div class="text-center text-xs mt-4">
        <p>Thank you for shopping!</p>
        <p>Visit Again</p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        }
      <\/script>
    </body>
    </html>
  `;
};
</script>

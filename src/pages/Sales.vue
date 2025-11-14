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
          <h2 class="text-xl font-bold">🏪 Al Zabeer POS</h2>
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
import axios from "axios";
import { ref, onMounted } from "vue";

const sales = ref([]);
const selectedInvoice = ref(null);
const products = ref([]);

onMounted(async () => {
  try {
    const [salesRes, productsRes] = await Promise.all([
      axios.get("http://127.0.0.1:8000/api/sales/"),
      axios.get("http://127.0.0.1:8000/api/products/")
    ]);
    sales.value = salesRes.data;
    products.value = productsRes.data;
  } catch (error) {
    console.error("Error loading data:", error);
  }
});

const formatDate = (d) => new Date(d).toLocaleString();

// Safe number formatting function
const formatNumber = (value) => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const getProductName = (productId) => {
  const product = products.value.find(p => p.id === productId);
  return product ? product.title : 'Unknown Product';
};

// Calculate points earned (1 point per 100৳ spent)
const calculatePointsEarned = () => {
  if (!selectedInvoice.value) return 0;
  const total = safeNumber(selectedInvoice.value.total);
  return Math.floor(total / 100);
};

// Calculate total points after transaction
const calculateTotalPoints = () => {
  if (!selectedInvoice.value || !selectedInvoice.value.customer) return 0;
  
  const currentPoints = safeNumber(selectedInvoice.value.customer.points || 0);
  const pointsEarned = calculatePointsEarned();
  const pointsRedeemed = safeNumber(selectedInvoice.value.redeem_points || 0);
  
  return currentPoints + pointsEarned - pointsRedeemed;
};

const viewInvoice = async (id) => {
  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/invoice/${id}/`);
    selectedInvoice.value = res.data;
    console.log("Invoice loaded:", selectedInvoice.value);
  } catch (error) {
    console.error("Error loading invoice:", error);
    alert("Error loading invoice details");
  }
};

const printReceipt = () => {
  console.log("Print button clicked");
  
  if (!selectedInvoice.value) {
    alert("No invoice selected");
    return;
  }

  try {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // Generate receipt content
    const receiptContent = generateReceiptContent();

    iframeDoc.open();
    iframeDoc.write(receiptContent);
    iframeDoc.close();

    // Wait for iframe to load then print
    iframe.onload = function() {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        
        // Remove iframe after printing
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

// Safe number conversion function
const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

const generateReceiptContent = () => {
  const invoice = selectedInvoice.value;
  
  // Calculate points
  const pointsEarned = calculatePointsEarned();
  const pointsRedeemed = safeNumber(invoice.redeem_points || 0);
  const currentPoints = safeNumber(invoice.customer?.points || 0);
  const totalPoints = currentPoints + pointsEarned - pointsRedeemed;
  
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
        
        .invoice-container {
          width: 100%;
        }
        
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
          font-weight: bold;
        }
        
        .totals-section {
          margin-top: 8px;
        }
        
        .total-line {
          border-top: 1px solid #000;
          padding-top: 4px;
          margin-top: 4px;
        }
        
        .points-section {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed #000;
          font-size: 11px;
        }
        
        .cut-line {
          margin-top: 16px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        
        @media print {
          body { 
            margin: 0;
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="text-center mb-2">
          <h1 class="font-bold" style="font-size: 14px;">Al Zabeer</h1>
          <p class="text-xs">Town Chikandi Bazar,</p>
          <p class="text-xs">Shariatpur Shadar, Shariatpur</p>
          <p class="text-xs">Phone: 01791927084</p>
          <p class="text-xs">Website: alzabeer.store</p>
        </div>

        <!-- Invoice Info -->
        <div class="text-xs mb-2">
          <p>Invoice #: ${invoice.id}</p>
          <p>Date: ${formatDate(invoice.date)}</p>
          <p>Customer: ${invoice.customer?.name || 'Walk-in'}</p>
          <p>Phone: ${invoice.customer?.phone || 'N/A'}</p>
        </div>

        <!-- Items Table -->
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
              const product = products.value.find(p => p.id === item.product);
              const productName = product ? product.title : 'Unknown Product';
              const itemTotal = safeNumber(item.total);
              const itemQuantity = safeNumber(item.quantity);
              const unitPrice = itemQuantity > 0 ? (itemTotal / itemQuantity) : 0;
              
              return `
                <tr>
                  <td class="text-left">${productName}</td>
                  <td class="text-center">${itemQuantity}</td>
                  <td class="text-right">৳${unitPrice.toFixed(2)}</td>
                  <td class="text-right">৳${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>৳${safeNumber(invoice.subtotal).toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span>Discount:</span>
            <span>৳${safeNumber(invoice.discount).toFixed(2)}</span>
          </div>
          <div class="flex justify-between font-bold total-line">
            <span>Total:</span>
            <span>৳${safeNumber(invoice.total).toFixed(2)}</span>
          </div>
        </div>

        <!-- Points Information -->
        ${invoice.customer ? `
        <div class="points-section">
          <div class="flex justify-between">
            <span>Previous Points:</span>
            <span>${currentPoints} pts</span>
          </div>
          <div class="flex justify-between">
            <span>Points Earned:</span>
            <span class="text-green">+${pointsEarned} pts</span>
          </div>
          ${pointsRedeemed > 0 ? `
          <div class="flex justify-between">
            <span>Points Redeemed:</span>
            <span class="text-red">-${pointsRedeemed} pts</span>
          </div>
          ` : ''}
          <div class="flex justify-between font-bold border-t border-dashed mt-1 pt-1">
            <span>Total Points:</span>
            <span>${totalPoints} pts</span>
          </div>
        </div>
        ` : ''}

        <!-- Footer -->
        <div class="text-center text-xs mt-4">
          <p>Thank you for shopping!</p>
          <p>Visit Again</p>
        </div>
        
        <!-- Cut line -->
        <div class="cut-line text-center mt-4">-------------------------------</div>
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(() => {
            window.print();
          }, 500);
        }
      <\/script>
    </body>
    </html>
  `;
};
</script>
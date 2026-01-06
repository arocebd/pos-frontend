<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Add Purchase</h2>

      <form @submit.prevent="submitPurchase">
        <!-- Supplier and Invoice Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
            <select v-model="purchase.supplier" required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="">Select Supplier</option>
              <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Invoice No *</label>
            <input v-model="purchase.invoice_no" type="text" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                   placeholder="INV-001">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input v-model="purchase.date" type="date" required
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <!-- Purchase Items -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-700">Purchase Items</h3>
            <button type="button" @click="addItem" 
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              + Add Item
            </button>
          </div>

          <!-- Items Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border p-2 text-left">Product/Variant</th>
                  <th class="border p-2 text-left">Pack Unit</th>
                  <th class="border p-2 text-right">Pack Size</th>
                  <th class="border p-2 text-right">Qty Packs</th>
                  <th class="border p-2 text-right">Price/Pack</th>
                  <th class="border p-2 text-left">Batch No</th>
                  <th class="border p-2 text-left">Expiry</th>
                  <th class="border p-2 text-right">MRP</th>
                  <th class="border p-2 text-right">Base Qty</th>
                  <th class="border p-2 text-right">Total</th>
                  <th class="border p-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in purchase.items" :key="index" class="hover:bg-gray-50">
                  <!-- Product Selection -->
                  <td class="border p-2">
                    <select v-model="item.product" @change="onProductChange(index)"
                            class="w-full px-2 py-1 border rounded text-sm">
                      <option value="">Select Product</option>
                      <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.title }} ({{ product.base_unit }})
                      </option>
                    </select>
                    <!-- Variant Selection (if product has variants) -->
                    <select v-if="item.hasVariants" v-model="item.product_variant" 
                            @change="onVariantChange(index)"
                            class="w-full px-2 py-1 border rounded text-sm mt-1">
                      <option value="">Select Variant</option>
                      <option v-for="variant in getProductVariants(item.product)" 
                              :key="variant.id" :value="variant.id">
                        {{ variant.variant_name }}
                      </option>
                    </select>
                  </td>

                  <!-- Pack Unit -->
                  <td class="border p-2">
                    <select v-model="item.pack_unit" class="w-full px-2 py-1 border rounded text-sm">
                      <option value="unit">Unit</option>
                      <option value="bag">Bag</option>
                      <option value="carton">Carton</option>
                      <option value="box">Box</option>
                      <option value="strip">Strip</option>
                      <option value="bottle">Bottle</option>
                      <option value="pack">Pack</option>
                    </select>
                  </td>

                  <!-- Pack Size -->
                  <td class="border p-2">
                    <input v-model.number="item.pack_size" type="number" step="0.001" min="0.001"
                           @input="calculateItemTotal(index)"
                           class="w-20 px-2 py-1 border rounded text-sm text-right">
                  </td>

                  <!-- Qty Packs -->
                  <td class="border p-2">
                    <input v-model.number="item.qty_packs" type="number" step="0.001" min="0.001"
                           @input="calculateItemTotal(index)"
                           class="w-20 px-2 py-1 border rounded text-sm text-right">
                  </td>

                  <!-- Price per Pack -->
                  <td class="border p-2">
                    <input v-model.number="item.price_per_pack" type="number" step="0.01" min="0"
                           @input="calculateItemTotal(index)"
                           class="w-24 px-2 py-1 border rounded text-sm text-right">
                  </td>

                  <!-- Batch No (Pharmacy) -->
                  <td class="border p-2">
                    <input v-model="item.batch_no" type="text"
                           class="w-24 px-2 py-1 border rounded text-sm"
                           placeholder="Optional">
                  </td>

                  <!-- Expiry Date (Pharmacy) -->
                  <td class="border p-2">
                    <input v-model="item.expiry_date" type="date"
                           class="w-32 px-2 py-1 border rounded text-sm">
                  </td>

                  <!-- MRP (Pharmacy) -->
                  <td class="border p-2">
                    <input v-model.number="item.mrp" type="number" step="0.01" min="0"
                           class="w-20 px-2 py-1 border rounded text-sm text-right"
                           placeholder="Optional">
                  </td>

                  <!-- Calculated: Total Base Quantity -->
                  <td class="border p-2 text-right font-medium text-gray-700">
                    {{ (item.pack_size * item.qty_packs).toFixed(3) }}
                  </td>

                  <!-- Calculated: Total -->
                  <td class="border p-2 text-right font-semibold text-gray-800">
                    {{ (item.price_per_pack * item.qty_packs).toFixed(2) }}
                  </td>

                  <!-- Delete -->
                  <td class="border p-2 text-center">
                    <button type="button" @click="removeItem(index)"
                            class="text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="purchase.items.length === 0" class="text-center py-8 text-gray-500">
            No items added. Click "Add Item" to start.
          </div>
        </div>

        <!-- Totals and Payment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Payment Details -->
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Payment Details</h3>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <input v-model.number="purchase.discount" type="number" step="0.01" min="0"
                       @input="calculateTotals"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                <select v-model="purchase.payment_method" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="mobile">Mobile Wallet</option>
                  <option value="due">Due</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Paid Amount *</label>
                <input v-model.number="purchase.paid_amount" type="number" step="0.01" min="0"
                       :max="purchase.total"
                       @input="calculateDue"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea v-model="purchase.remarks" rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Additional notes..."></textarea>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span class="font-semibold">৳{{ subtotal.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between text-gray-700">
                <span>Discount:</span>
                <span class="font-semibold text-red-600">- ৳{{ purchase.discount.toFixed(2) }}</span>
              </div>
              
              <div class="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>৳{{ purchase.total.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between text-gray-700">
                <span>Paid:</span>
                <span class="font-semibold text-green-600">৳{{ purchase.paid_amount.toFixed(2) }}</span>
              </div>
              
              <div class="flex justify-between text-lg font-semibold" 
                   :class="dueAmount > 0 ? 'text-orange-600' : 'text-gray-700'">
                <span>Due:</span>
                <span>৳{{ dueAmount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Messages -->
        <div v-if="errors.length > 0" class="mb-4 p-4 bg-red-100 border border-red-400 rounded-md">
          <p class="font-semibold text-red-800 mb-2">Please fix the following errors:</p>
          <ul class="list-disc list-inside text-red-700">
            <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
          </ul>
        </div>

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-4">
          <button type="button" @click="resetForm"
                  class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            Reset
          </button>
          <button type="submit" :disabled="loading"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50">
            {{ loading ? 'Saving...' : 'Save Purchase' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AddPurchase',
  data() {
    return {
      purchase: {
        supplier: '',
        invoice_no: '',
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        payment_method: 'cash',
        paid_amount: 0,
        remarks: '',
        items: [],
        subtotal: 0,
        total: 0
      },
      suppliers: [],
      products: [],
      variants: {},
      errors: [],
      loading: false
    };
  },
  computed: {
    subtotal() {
      return this.purchase.items.reduce((sum, item) => {
        return sum + (item.price_per_pack * item.qty_packs);
      }, 0);
    },
    dueAmount() {
      return Math.max(0, this.purchase.total - this.purchase.paid_amount);
    }
  },
  mounted() {
    this.loadSuppliers();
    this.loadProducts();
  },
  methods: {
    async loadSuppliers() {
      try {
        const response = await axios.get('/api/suppliers/');
        this.suppliers = response.data.results || response.data;
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    },
    async loadProducts() {
      try {
        const response = await axios.get('/api/products/');
        this.products = response.data.results || response.data;
      } catch (error) {
        console.error('Error loading products:', error);
      }
    },
    async loadVariants(productId) {
      if (!this.variants[productId]) {
        try {
          const response = await axios.get(`/api/product-variants/?product=${productId}`);
          this.$set(this.variants, productId, response.data.results || response.data);
        } catch (error) {
          console.error('Error loading variants:', error);
        }
      }
    },
    getProductVariants(productId) {
      return this.variants[productId] || [];
    },
    addItem() {
      this.purchase.items.push({
        product: '',
        product_variant: null,
        hasVariants: false,
        pack_unit: 'unit',
        pack_size: 1,
        qty_packs: 1,
        price_per_pack: 0,
        batch_no: '',
        expiry_date: '',
        mrp: null
      });
    },
    removeItem(index) {
      this.purchase.items.splice(index, 1);
      this.calculateTotals();
    },
    async onProductChange(index) {
      const item = this.purchase.items[index];
      const product = this.products.find(p => p.id === item.product);
      
      if (product) {
        item.hasVariants = product.has_variants;
        item.product_variant = null;
        
        if (product.has_variants) {
          await this.loadVariants(product.id);
        }
      }
    },
    onVariantChange(index) {
      // Variant changed - could update pricing if needed
      this.calculateItemTotal(index);
    },
    calculateItemTotal(index) {
      // Items are reactive, totals will auto-update
      this.calculateTotals();
    },
    calculateTotals() {
      this.purchase.subtotal = this.subtotal;
      this.purchase.total = Math.max(0, this.subtotal - this.purchase.discount);
      
      // Auto-set paid amount if payment is not 'due'
      if (this.purchase.payment_method !== 'due') {
        this.purchase.paid_amount = this.purchase.total;
      }
      
      this.calculateDue();
    },
    calculateDue() {
      // Due is computed property, no need to store
    },
    validate() {
      this.errors = [];
      
      if (!this.purchase.supplier) {
        this.errors.push('Supplier is required');
      }
      
      if (!this.purchase.invoice_no) {
        this.errors.push('Invoice number is required');
      }
      
      if (this.purchase.items.length === 0) {
        this.errors.push('At least one item is required');
      }
      
      this.purchase.items.forEach((item, index) => {
        if (!item.product) {
          this.errors.push(`Item ${index + 1}: Product is required`);
        }
        
        if (item.hasVariants && !item.product_variant) {
          this.errors.push(`Item ${index + 1}: Variant is required`);
        }
        
        if (item.pack_size <= 0) {
          this.errors.push(`Item ${index + 1}: Pack size must be greater than 0`);
        }
        
        if (item.qty_packs <= 0) {
          this.errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        
        if (item.price_per_pack < 0) {
          this.errors.push(`Item ${index + 1}: Price cannot be negative`);
        }
      });
      
      if (this.purchase.paid_amount > this.purchase.total) {
        this.errors.push('Paid amount cannot exceed total');
      }
      
      return this.errors.length === 0;
    },
    async submitPurchase() {
      if (!this.validate()) {
        return;
      }
      
      this.loading = true;
      this.errors = [];
      
      try {
        // Prepare data
        const data = {
          supplier: this.purchase.supplier,
          invoice_no: this.purchase.invoice_no,
          date: this.purchase.date,
          discount: this.purchase.discount,
          payment_method: this.purchase.payment_method,
          paid_amount: this.purchase.paid_amount,
          remarks: this.purchase.remarks,
          items: this.purchase.items.map(item => ({
            product: item.product_variant ? null : item.product,
            product_variant: item.product_variant || null,
            pack_unit: item.pack_unit,
            pack_size: item.pack_size,
            qty_packs: item.qty_packs,
            price_per_pack: item.price_per_pack,
            batch_no: item.batch_no || null,
            expiry_date: item.expiry_date || null,
            mrp: item.mrp || null
          }))
        };
        
        const response = await axios.post('/api/purchases/', data);
        
        alert('Purchase saved successfully!');
        this.resetForm();
        
        // Optionally redirect to purchases list
        // this.$router.push('/purchases');
        
      } catch (error) {
        console.error('Error saving purchase:', error);
        
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'object') {
            Object.keys(errorData).forEach(key => {
              const value = errorData[key];
              if (Array.isArray(value)) {
                this.errors.push(`${key}: ${value.join(', ')}`);
              } else {
                this.errors.push(`${key}: ${value}`);
              }
            });
          } else {
            this.errors.push('Error saving purchase. Please try again.');
          }
        } else {
          this.errors.push('Network error. Please check your connection.');
        }
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.purchase = {
        supplier: '',
        invoice_no: '',
        date: new Date().toISOString().split('T')[0],
        discount: 0,
        payment_method: 'cash',
        paid_amount: 0,
        remarks: '',
        items: [],
        subtotal: 0,
        total: 0
      };
      this.errors = [];
    }
  }
};
</script>

<style scoped>
/* Add any custom styles here */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>

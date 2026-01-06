<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Left: Product Selection -->
    <div class="w-2/3 p-4 overflow-y-auto">
      <!-- Search and Barcode -->
      <div class="mb-4">
        <div class="relative">
          <input 
            ref="barcodeInput"
            v-model="searchQuery" 
            @input="searchProducts"
            @keyup.enter="handleBarcodeSearch"
            type="text" 
            placeholder="Search products or scan barcode..."
            class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            autofocus>
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Category Filters -->
      <div class="mb-4 flex flex-wrap gap-2">
        <button 
          @click="selectedCategory = null"
          :class="['px-4 py-2 rounded-md transition', 
                   selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100']">
          All
        </button>
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['px-4 py-2 rounded-md transition', 
                   selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100']">
          {{ category.name }}
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          @click="selectProduct(product)"
          class="bg-white p-4 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
          <div v-if="product.image_url" class="w-full h-32 mb-2 overflow-hidden rounded">
            <img :src="product.image_url" :alt="product.title" class="w-full h-full object-cover">
          </div>
          <div v-else class="w-full h-32 mb-2 bg-gray-200 rounded flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">{{ product.title }}</h3>
          <p class="text-blue-600 font-bold">৳{{ product.selling_price }}</p>
          <p class="text-xs text-gray-500">Stock: {{ product.stock }} {{ product.base_unit }}</p>
          <span v-if="product.has_variants" 
                class="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
            Has Variants
          </span>
        </div>
      </div>

      <div v-if="filteredProducts.length === 0" class="text-center py-12 text-gray-500">
        No products found
      </div>
    </div>

    <!-- Right: Cart -->
    <div class="w-1/3 bg-white p-6 shadow-lg flex flex-col">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Cart</h2>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto mb-4">
        <div v-if="cartItems.length === 0" class="text-center py-12 text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>Cart is empty</p>
        </div>

        <div v-for="(item, index) in cartItems" :key="index" 
             class="mb-3 p-3 border border-gray-200 rounded-lg">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800 text-sm">{{ item.title }}</h4>
              <p v-if="item.variant_name" class="text-xs text-purple-600">{{ item.variant_name }}</p>
              <p class="text-xs text-gray-500">{{ item.base_unit }}</p>
              <p v-if="item.batch_no" class="text-xs text-orange-600">Batch: {{ item.batch_no }}</p>
            </div>
            <button @click="removeFromCart(index)" class="text-red-600 hover:text-red-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button @click="decreaseQuantity(index)" 
                      class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300">-</button>
              <input 
                v-model="item.quantity" 
                @input="updateQuantity(index)"
                :type="isWeightUnit(item.base_unit) ? 'number' : 'number'"
                :step="isWeightUnit(item.base_unit) ? '0.001' : '1'"
                :min="isWeightUnit(item.base_unit) ? '0.001' : '1'"
                class="w-20 px-2 py-1 border border-gray-300 rounded text-center">
              <button @click="increaseQuantity(index)" 
                      class="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300">+</button>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">৳{{ item.price }}</p>
              <p class="font-bold text-blue-600">৳{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Selection -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Customer (Optional)</label>
        <select v-model="selectedCustomer" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option :value="null">Guest</option>
          <option v-for="customer in customers" :key="customer.id" :value="customer">
            {{ customer.name }} - {{ customer.phone }}
          </option>
        </select>
        <p v-if="selectedCustomer" class="text-xs text-green-600 mt-1">
          Points Available: {{ selectedCustomer.points }}
        </p>
      </div>

      <!-- Totals -->
      <div class="border-t pt-4 mb-4 space-y-2">
        <div class="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span class="font-semibold">৳{{ subtotal.toFixed(2) }}</span>
        </div>
        
        <div>
          <label class="block text-sm text-gray-700 mb-1">Discount:</label>
          <input v-model.number="discount" type="number" step="0.01" min="0" :max="subtotal"
                 class="w-full px-3 py-1 border border-gray-300 rounded-md text-right">
        </div>

        <div class="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
          <span>Total:</span>
          <span>৳{{ total.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <select v-model="paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-md">
          <option value="cash">Cash</option>
          <option value="bkash">bKash</option>
          <option value="nagad">Nagad</option>
          <option value="card">Card</option>
          <option value="rocket">Rocket</option>
          <option value="bank">Bank Transfer</option>
          <option value="due">Due</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2">
        <button 
          @click="processSale" 
          :disabled="cartItems.length === 0 || processing"
          class="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold">
          {{ processing ? 'Processing...' : 'Complete Sale' }}
        </button>
        <button 
          @click="clearCart"
          class="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          Clear Cart
        </button>
      </div>
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
            v-for="variant in productVariants" 
            :key="variant.id"
            @click="selectVariant(variant)"
            class="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-semibold">{{ variant.variant_name }}</p>
                <p class="text-sm text-gray-500">Stock: {{ variant.stock }}</p>
              </div>
              <p class="font-bold text-blue-600">৳{{ variant.selling_price }}</p>
            </div>
          </div>
        </div>

        <button @click="showVariantModal = false"
                class="mt-4 w-full py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'POSPage',
  data() {
    return {
      searchQuery: '',
      selectedCategory: null,
      products: [],
      categories: [],
      customers: [],
      cartItems: [],
      selectedCustomer: null,
      discount: 0,
      paymentMethod: 'cash',
      processing: false,
      
      // Variant selection
      showVariantModal: false,
      selectedProduct: null,
      productVariants: [],
      
      // Stock ledger for FIFO
      stockLedger: {}
    };
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;
      
      if (this.selectedCategory) {
        filtered = filtered.filter(p => p.category === this.selectedCategory);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) ||
          p.product_code?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.barcode?.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    },
    subtotal() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    total() {
      return Math.max(0, this.subtotal - this.discount);
    }
  },
  mounted() {
    this.loadCategories();
    this.loadProducts();
    this.loadCustomers();
    
    // Focus barcode input
    this.$refs.barcodeInput?.focus();
  },
  methods: {
    async loadCategories() {
      try {
        const response = await axios.get('/api/categories/');
        this.categories = response.data.results || response.data;
      } catch (error) {
        console.error('Error loading categories:', error);
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
    async loadCustomers() {
      try {
        const response = await axios.get('/api/customers/');
        this.customers = response.data.results || response.data;
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    },
    async loadVariants(productId) {
      try {
        const response = await axios.get(`/api/product-variants/?product=${productId}`);
        this.productVariants = response.data.results || response.data;
      } catch (error) {
        console.error('Error loading variants:', error);
      }
    },
    async loadStockLedger(productId, variantId = null) {
      // Load available batches for FIFO (earliest expiry first)
      try {
        const params = variantId ? { product_variant: variantId } : { product: productId };
        const response = await axios.get('/api/stock-ledger/', { params });
        
        const batches = (response.data.results || response.data)
          .filter(entry => entry.remaining_qty > 0)
          .sort((a, b) => {
            // Sort by expiry date (null last), then by transaction date
            if (!a.expiry_date && !b.expiry_date) return new Date(a.transaction_date) - new Date(b.transaction_date);
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;
            return new Date(a.expiry_date) - new Date(b.expiry_date);
          });
        
        const key = variantId ? `v_${variantId}` : `p_${productId}`;
        this.$set(this.stockLedger, key, batches);
        
        return batches;
      } catch (error) {
        console.error('Error loading stock ledger:', error);
        return [];
      }
    },
    searchProducts() {
      // Debounce search if needed
    },
    async handleBarcodeSearch() {
      if (!this.searchQuery) return;
      
      // Try to find product by barcode
      let product = this.products.find(p => 
        p.barcode === this.searchQuery || 
        p.sku === this.searchQuery
      );
      
      if (product) {
        this.selectProduct(product);
        this.searchQuery = '';
        return;
      }
      
      // Try to find variant by barcode
      try {
        const response = await axios.get(`/api/product-variants/?search=${this.searchQuery}`);
        const variants = response.data.results || response.data;
        const variant = variants.find(v => v.barcode === this.searchQuery || v.sku === this.searchQuery);
        
        if (variant) {
          product = this.products.find(p => p.id === variant.product);
          if (product) {
            await this.addToCart(product, variant);
            this.searchQuery = '';
            return;
          }
        }
      } catch (error) {
        console.error('Error searching variants:', error);
      }
      
      // Not found
      alert('Product not found');
      this.searchQuery = '';
    },
    async selectProduct(product) {
      if (product.has_variants) {
        // Show variant selection modal
        this.selectedProduct = product;
        await this.loadVariants(product.id);
        this.showVariantModal = true;
      } else {
        // Add directly to cart
        await this.addToCart(product, null);
      }
    },
    async selectVariant(variant) {
      const product = this.selectedProduct;
      this.showVariantModal = false;
      await this.addToCart(product, variant);
    },
    async addToCart(product, variant = null) {
      // For pharmacy: load batches and use FIFO
      const batches = await this.loadStockLedger(product.id, variant?.id);
      const batch = batches.length > 0 ? batches[0] : null;
      
      // Check if item already in cart
      const existingIndex = this.cartItems.findIndex(item => 
        item.product_id === product.id && 
        item.variant_id === variant?.id &&
        item.batch_no === batch?.batch_no
      );
      
      if (existingIndex >= 0) {
        // Increase quantity
        this.increaseQuantity(existingIndex);
      } else {
        // Add new item
        const quantityStep = this.isWeightUnit(product.base_unit) ? 0.001 : 1;
        
        this.cartItems.push({
          product_id: product.id,
          variant_id: variant?.id || null,
          title: product.title,
          variant_name: variant?.variant_name || null,
          price: variant?.selling_price || product.selling_price,
          quantity: quantityStep,
          base_unit: product.base_unit,
          stock: variant?.stock || product.stock,
          batch_no: batch?.batch_no || null,
          expiry_date: batch?.expiry_date || null
        });
      }
      
      // Refocus barcode input
      this.$nextTick(() => {
        this.$refs.barcodeInput?.focus();
      });
    },
    isWeightUnit(unit) {
      return ['kg', 'g', 'ltr', 'ml'].includes(unit);
    },
    increaseQuantity(index) {
      const item = this.cartItems[index];
      const step = this.isWeightUnit(item.base_unit) ? 0.001 : 1;
      item.quantity = parseFloat((parseFloat(item.quantity) + step).toFixed(3));
    },
    decreaseQuantity(index) {
      const item = this.cartItems[index];
      const step = this.isWeightUnit(item.base_unit) ? 0.001 : 1;
      const newQty = parseFloat((parseFloat(item.quantity) - step).toFixed(3));
      
      if (newQty < step) {
        this.removeFromCart(index);
      } else {
        item.quantity = newQty;
      }
    },
    updateQuantity(index) {
      const item = this.cartItems[index];
      const minQty = this.isWeightUnit(item.base_unit) ? 0.001 : 1;
      
      if (item.quantity < minQty) {
        item.quantity = minQty;
      }
    },
    removeFromCart(index) {
      this.cartItems.splice(index, 1);
    },
    clearCart() {
      if (confirm('Clear all items from cart?')) {
        this.cartItems = [];
        this.discount = 0;
        this.selectedCustomer = null;
      }
    },
    async processSale() {
      if (this.cartItems.length === 0) return;
      
      // Validation
      for (const item of this.cartItems) {
        if (item.quantity > item.stock) {
          alert(`Insufficient stock for ${item.title}. Available: ${item.stock}`);
          return;
        }
      }
      
      this.processing = true;
      
      try {
        const saleData = {
          subtotal: this.subtotal,
          discount: this.discount,
          total: this.total,
          payment: {
            method: this.paymentMethod,
            paid_amount: this.total,
            trx_id: ''
          },
          items: this.cartItems.map(item => ({
            product: item.variant_id ? null : item.product_id,
            product_variant: item.variant_id,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          customer_data: this.selectedCustomer ? {
            name: this.selectedCustomer.name,
            phone: this.selectedCustomer.phone
          } : null,
          redeemed_points: 0
        };
        
        const response = await axios.post('/api/sales/', saleData);
        
        alert('Sale completed successfully!');
        
        // Clear cart and reset
        this.cartItems = [];
        this.discount = 0;
        this.selectedCustomer = null;
        this.paymentMethod = 'cash';
        
        // Reload products to update stock
        await this.loadProducts();
        
        // Refocus barcode input
        this.$nextTick(() => {
          this.$refs.barcodeInput?.focus();
        });
        
      } catch (error) {
        console.error('Error processing sale:', error);
        alert('Error processing sale. Please try again.');
      } finally {
        this.processing = false;
      }
    }
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

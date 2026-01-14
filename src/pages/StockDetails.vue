<template>
  <div class="max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Stock Details</h2>
      <div class="flex gap-2">
        <button @click="refreshStock" class="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Search Product</label>
          <input
            v-model="searchQuery"
            @input="filterStock"
            placeholder="Search by name, code, or barcode..."
            class="w-full border rounded-lg p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Filter by Category</label>
          <select v-model="selectedCategory" @change="filterStock" class="w-full border rounded-lg p-2">
            <option :value="null">All Categories</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold mb-1">Stock Status</label>
          <select v-model="stockFilter" @change="filterStock" class="w-full border rounded-lg p-2">
            <option value="all">All Stock</option>
            <option value="in-stock">In Stock Only</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="text-gray-500 text-lg">Loading stock data...</div>
    </div>

    <!-- Stock Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-100 text-gray-700">
          <tr>
            <th class="px-4 py-3 text-left">#</th>
            <th class="px-4 py-3 text-left">Product</th>
            <th class="px-4 py-3 text-left">Code/SKU</th>
            <th class="px-4 py-3 text-left">Category</th>
            <th class="px-4 py-3 text-right">Total Stock</th>
            <th class="px-4 py-3 text-right">Purchase Price</th>
            <th class="px-4 py-3 text-center">Has Variants</th>
            <th class="px-4 py-3 text-left">Last Purchase</th>
            <th class="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filteredStock" :key="item.id" class="border-t hover:bg-gray-50">
            <td class="px-4 py-3">{{ index + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img 
                  v-if="item.image" 
                  :src="item.image" 
                  :alt="item.title"
                  class="w-12 h-12 object-cover rounded border"
                />
                <div v-else class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                  📦
                </div>
                <div>
                  <div class="font-semibold">{{ item.title }}</div>
                  <div v-if="item.barcode" class="text-xs text-gray-500">Barcode: {{ item.barcode }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="text-sm">{{ item.product_code }}</div>
              <div v-if="item.sku" class="text-xs text-gray-500">SKU: {{ item.sku }}</div>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{{ item.category_name }}</span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="font-bold" :class="getStockColorClass(item.stock)">
                {{ item.stock }} {{ item.base_unit }}
              </div>
              <div v-if="item.has_variants" class="text-xs text-purple-600">
                {{ item.variant_count }} variant(s)
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              ৳ {{ parseFloat(item.purchased_price || 0).toFixed(2) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span v-if="item.has_variants" class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Yes
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3">
              <div v-if="item.last_purchase_date" class="text-sm">
                {{ formatDate(item.last_purchase_date) }}
              </div>
              <div v-else class="text-gray-400 text-sm">N/A</div>
            </td>
            <td class="px-4 py-3 text-center">
              <button 
                @click="addToSelling(item)"
                class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                ➕ Add to Selling
              </button>
            </td>
          </tr>
          <tr v-if="filteredStock.length === 0">
            <td colspan="9" class="text-center py-12 text-gray-500">
              <div class="text-lg mb-2">📭 No stock items found</div>
              <div class="text-sm">Try adjusting your search or filters</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600 mb-1">Total Products</div>
        <div class="text-2xl font-bold text-blue-600">{{ stockSummary.totalProducts }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600 mb-1">In Stock</div>
        <div class="text-2xl font-bold text-green-600">{{ stockSummary.inStock }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600 mb-1">Low Stock</div>
        <div class="text-2xl font-bold text-orange-600">{{ stockSummary.lowStock }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600 mb-1">Out of Stock</div>
        <div class="text-2xl font-bold text-red-600">{{ stockSummary.outOfStock }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/axios';

const router = useRouter();

// State
const loading = ref(false);
const stockData = ref([]);
const categories = ref([]);
const searchQuery = ref('');
const selectedCategory = ref(null);
const stockFilter = ref('all');

// Load stock data
const loadStockData = async () => {
  loading.value = true;
  try {
    // Fetch all products with their stock information
    const { data } = await api.get('products/');
    stockData.value = data.map(product => ({
      ...product,
      category_name: product.category_name || 'Uncategorized',
      variant_count: 0,
      last_purchase_date: null
    }));

    // Fetch variant counts if products have variants
    const variantPromises = stockData.value
      .filter(p => p.has_variants)
      .map(async (product) => {
        try {
          const { data: variants } = await api.get(`product-variants/?product=${product.id}`);
          product.variant_count = variants.length;
        } catch (err) {
          console.error(`Failed to fetch variants for product ${product.id}`, err);
        }
      });
    
    await Promise.all(variantPromises);

    // Try to fetch purchase history for last purchase date
    try {
      const { data: purchases } = await api.get('purchases/');
      // Map last purchase dates to products
      purchases.forEach(purchase => {
        if (purchase.items) {
          purchase.items.forEach(item => {
            const product = stockData.value.find(p => p.id === item.product);
            if (product) {
              if (!product.last_purchase_date || new Date(purchase.date) > new Date(product.last_purchase_date)) {
                product.last_purchase_date = purchase.date;
              }
            }
          });
        }
      });
    } catch (err) {
      console.warn('Could not fetch purchase history', err);
    }

  } catch (error) {
    console.error('Failed to load stock data', error);
    alert('❌ Failed to load stock data: ' + (error.response?.data?.detail || error.message));
  } finally {
    loading.value = false;
  }
};

// Load categories
const loadCategories = async () => {
  try {
    const { data } = await api.get('categories/');
    categories.value = data;
  } catch (err) {
    console.error('Failed to fetch categories', err);
  }
};

// Filter stock
const filteredStock = computed(() => {
  let result = [...stockData.value];

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.product_code.toLowerCase().includes(query) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.barcode && item.barcode.toLowerCase().includes(query))
    );
  }

  // Category filter
  if (selectedCategory.value !== null) {
    result = result.filter(item => item.category === selectedCategory.value);
  }

  // Stock status filter
  if (stockFilter.value !== 'all') {
    result = result.filter(item => {
      const stock = parseFloat(item.stock || 0);
      if (stockFilter.value === 'in-stock') return stock > 10;
      if (stockFilter.value === 'low-stock') return stock > 0 && stock <= 10;
      if (stockFilter.value === 'out-of-stock') return stock === 0;
      return true;
    });
  }

  return result;
});

// Stock summary
const stockSummary = computed(() => {
  const total = stockData.value.length;
  const inStock = stockData.value.filter(item => parseFloat(item.stock || 0) > 10).length;
  const lowStock = stockData.value.filter(item => {
    const stock = parseFloat(item.stock || 0);
    return stock > 0 && stock <= 10;
  }).length;
  const outOfStock = stockData.value.filter(item => parseFloat(item.stock || 0) === 0).length;

  return {
    totalProducts: total,
    inStock,
    lowStock,
    outOfStock
  };
});

// Get stock color class
const getStockColorClass = (stock) => {
  const stockValue = parseFloat(stock || 0);
  if (stockValue === 0) return 'text-red-600';
  if (stockValue <= 10) return 'text-orange-600';
  return 'text-green-600';
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Refresh stock
const refreshStock = () => {
  loadStockData();
};

// Filter stock (called when filters change)
const filterStock = () => {
  // Reactive computed property handles this automatically
};

// Add to selling - Navigate to AddProduct with pre-filled data
const addToSelling = (item) => {
  // Store the stock item data in sessionStorage to pass to AddProduct
  sessionStorage.setItem('stockItemForSelling', JSON.stringify({
    productId: item.id,
    title: item.title,
    product_code: item.product_code,
    sku: item.sku,
    barcode: item.barcode,
    category: item.category,
    base_unit: item.base_unit,
    has_variants: item.has_variants,
    purchased_price: item.purchased_price,
    regular_price: item.regular_price,
    selling_price: item.selling_price,
    discount: item.discount,
    currentStock: item.stock,
    image: item.image,
    fromStock: true
  }));

  // Navigate to AddProduct page
  router.push({ name: 'AddProduct', query: { fromStock: 'true', productId: item.id } });
};

// Mount
onMounted(() => {
  loadStockData();
  loadCategories();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>

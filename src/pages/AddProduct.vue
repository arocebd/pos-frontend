<template>
  <div class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Add Product</h2>
      <div class="flex gap-2">
        <button @click="goBack" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">← Back</button>
      </div>
    </div>

    <!-- Restock Info Banner -->
    <div v-if="isRestockMode" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-white text-xl">📦</span>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-blue-900 mb-1">Restocking Product from Inventory</h3>
          <p class="text-sm text-blue-700 mb-2">Adding stock for an existing product. Current stock will be updated.</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-blue-600 font-medium">Current Stock:</span>
              <span class="ml-2 font-bold text-blue-900">{{ stockItemData.currentStock }} {{ stockItemData.base_unit }}</span>
            </div>
            <div>
              <span class="text-blue-600 font-medium">Product ID:</span>
              <span class="ml-2 font-bold text-blue-900">#{{ stockItemData.productId }}</span>
            </div>
          </div>
        </div>
        <button @click="cancelRestock" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          Cancel & Clear
        </button>
      </div>
    </div>

    <!-- Main form card -->
    <div class="bg-white rounded-lg shadow p-6">
      <!-- 3-col grid on desktop, 1-col on mobile -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-semibold mb-1">Title *</label>
          <input v-model="form.title" class="w-full border rounded-lg p-2" placeholder="Product name" />
        </div>

        <!-- Product Code -->
        <div>
          <label class="block text-sm font-semibold mb-1">Product Code *</label>
          <input v-model="form.product_code" class="w-full border rounded-lg p-2" placeholder="e.g., PROD001" />
        </div>

        <!-- SKU -->
        <div>
          <label class="block text-sm font-semibold mb-1">SKU</label>
          <input v-model="form.sku" class="w-full border rounded-lg p-2" placeholder="Optional" />
        </div>

        <!-- Category -->
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold mb-1">Category *</label>
          <div class="flex gap-2">
            <select v-model="form.category" class="border rounded-lg p-2 flex-1">
              <option :value="null" disabled>-- Select Category --</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <input v-model="newCat" placeholder="New category" class="border rounded-lg p-2 w-44" />
            <button
              class="px-3 py-2 rounded-lg border hover:bg-gray-100"
              :disabled="addingCat || !newCat.trim()"
              @click="addCategory"
            >
              {{ addingCat ? "Adding..." : "+ Add" }}
            </button>
          </div>
        </div>

        <!-- Base Unit -->
        <div>
          <label class="block text-sm font-semibold mb-1">Base Unit *</label>
          <select v-model="form.base_unit" class="w-full border rounded-lg p-2">
            <option value="pcs">Pieces (pcs)</option>
            <option value="kg">Kilogram (kg)</option>
            <option value="g">Gram (g)</option>
            <option value="ltr">Liter (ltr)</option>
            <option value="ml">Milliliter (ml)</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Unit for inventory tracking</p>
        </div>

        <!-- Purchase Price -->
        <div>
          <label class="block text-sm font-semibold mb-1">Purchase Price (per {{ form.base_unit }}) *</label>
          <input 
            v-model.number="form.purchased_price" 
            type="number" 
            step="0.01" 
            min="0"
            class="w-full border rounded-lg p-2" 
            placeholder="0.00"
          />
        </div>

        <!-- Regular Price -->
        <div>
          <label class="block text-sm font-semibold mb-1">Regular Price (per {{ form.base_unit }}) *</label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            v-model.number="form.regular_price" 
            class="w-full border rounded-lg p-2" 
            placeholder="0.00"
          />
        </div>

        <!-- Selling Price -->
        <div>
          <label class="block text-sm font-semibold mb-1">Selling Price (per {{ form.base_unit }})</label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            v-model.number="form.selling_price" 
            class="w-full border rounded-lg p-2" 
            placeholder="0.00"
          />
        </div>

        <!-- Discount -->
        <div>
          <label class="block text-sm font-semibold mb-1">Discount (৳)</label>
          <input 
            type="number" 
            step="0.01" 
            min="0"
            v-model.number="form.discount" 
            class="w-full border rounded-lg p-2" 
            placeholder="0.00"
          />
        </div>

        <!-- VAT -->
        <div class="md:col-span-2">
          <label class="flex items-center gap-3">
            <input type="checkbox" v-model="form.vat_applicable" class="w-4 h-4" />
            <span class="text-sm font-medium">VAT applicable for this product</span>
          </label>
          <div v-if="form.vat_applicable" class="mt-2 flex gap-2 items-center">
            <input
              v-model.number="form.vat_percent"
              type="number"
              min="0"
              step="0.01"
              class="w-32 border rounded-lg p-2"
              placeholder="VAT %"
            />
            <p class="text-xs text-gray-500">Enter VAT percentage (e.g., 5 for 5%)</p>
          </div>
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-semibold mb-1">
            {{ isRestockMode ? 'Add Stock Quantity' : 'Initial Stock' }}
          </label>
          <input 
            type="number" 
            :step="isWeightUnit ? '0.001' : '1'" 
            :min="0"
            v-model.number="form.stock" 
            class="w-full border rounded-lg p-2" 
            :placeholder="isRestockMode ? 'Enter quantity to add' : '0'"
          />
          <p v-if="isRestockMode" class="text-xs text-blue-600 mt-1 font-medium">
            Current: {{ stockItemData.currentStock }} {{ form.base_unit }} | 
            After adding: {{ totalStockAfterRestock }} {{ form.base_unit }}
          </p>
          <p v-else class="text-xs text-gray-500 mt-1">In {{ form.base_unit }}</p>
        </div>

        <!-- Barcode -->
        <div class="md:col-span-2">
          <label class="block text-sm font-semibold mb-1">Barcode</label>
          <div class="flex gap-2">
            <input v-model="form.barcode" class="border rounded-lg p-2 flex-1" placeholder="Optional" />
            <button 
              class="px-3 py-2 rounded-lg border hover:bg-gray-100"
              @click="generateBarcode"
              type="button"
            >
              Generate
            </button>
          </div>
        </div>

        <!-- Has Variants -->
        <div class="md:col-span-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.has_variants" class="w-4 h-4" />
            <span class="text-sm font-medium">This product has variants (size/color/strength/ml)</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">Enable for products with multiple variants. Each variant gets a separate SKU and stock.</p>
        </div>

        <!-- Product Image -->
        <div class="md:col-span-3">
          <label class="block text-sm font-semibold mb-1">Product Image</label>
          <input type="file" accept="image/*" @change="onImage" ref="imageInput" />
          <p class="text-xs text-gray-500 mt-1">Auto-compressed to 300x300px WebP format (15-50KB)</p>
          <div v-if="imagePreview" class="mt-2">
            <img :src="imagePreview" alt="Preview" class="w-32 h-32 object-cover border rounded" />
            <p v-if="compressedImageSize" class="text-xs text-green-600 mt-1">
              Compressed size: {{ compressedImageSize }}
            </p>
          </div>
        </div>
      </div>

      <!-- Variants Section -->
      <div v-if="form.has_variants" class="border-t pt-6 mt-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Product Variants</h3>
          <button 
            @click="addVariant" 
            type="button"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            + Add Variant
          </button>
        </div>

        <div v-if="variants.length === 0" class="text-center py-4 text-gray-500">
          No variants added yet. Click "Add Variant" to create one.
        </div>

        <div v-else class="space-y-3">
          <div v-for="(variant, index) in variants" :key="index" 
               class="border rounded-lg p-4 bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs font-semibold mb-1">Variant Name *</label>
                <input 
                  v-model="variant.variant_name" 
                  placeholder="e.g., 500ml, Red, XL" 
                  class="w-full border rounded p-2 text-sm" 
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">SKU</label>
                <input 
                  v-model="variant.sku" 
                  class="w-full border rounded p-2 text-sm" 
                  placeholder="Optional"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Barcode</label>
                <input 
                  v-model="variant.barcode" 
                  class="w-full border rounded p-2 text-sm" 
                  placeholder="Optional"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Purchase Price</label>
                <input 
                  v-model.number="variant.purchase_price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  class="w-full border rounded p-2 text-sm" 
                  placeholder="0.00"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1">Selling Price</label>
                <input 
                  v-model.number="variant.selling_price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  class="w-full border rounded p-2 text-sm" 
                  placeholder="0.00"
                />
              </div>
            </div>
            <div class="flex justify-between items-center mt-3">
              <div class="flex-1">
                <label class="block text-xs font-semibold mb-1">Initial Stock ({{ form.base_unit }})</label>
                <input 
                  v-model.number="variant.stock" 
                  type="number" 
                  :step="isWeightUnit ? '0.001' : '1'" 
                  :min="0"
                  class="w-32 border rounded p-2 text-sm" 
                  placeholder="0"
                />
              </div>
              <button 
                @click="removeVariant(index)" 
                type="button"
                class="text-red-600 hover:text-red-800 px-3 py-1">
                🗑️ Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="flex justify-end gap-2 mt-6 pt-6 border-t">
        <button
          class="px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          @click="resetForm"
          type="button"
        >
          Clear
        </button>
        <button
          class="px-6 py-2 rounded-lg text-white"
          :class="canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'"
          :disabled="loading || !canSave"
          @click="submitForm"
        >
          {{ loading ? "Saving..." : "Save Product" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/axios";

const router = useRouter();

const form = ref({
  title: "",
  product_code: "",
  sku: "",
  barcode: "",
  category: null,
  base_unit: "pcs",
  has_variants: false,
  purchased_price: null,
  regular_price: null,
  selling_price: null,
  discount: 0,
  stock: 0,
  image: null,
});

const variants = ref([]);
const categories = ref([]);
const newCat = ref("");
const addingCat = ref(false);
const loading = ref(false);
const imagePreview = ref(null);
const compressedImageSize = ref(null);
const imageInput = ref(null);
const isRestockMode = ref(false);
const stockItemData = ref({
  productId: null,
  currentStock: 0,
  title: '',
  base_unit: 'pcs'
});

// Computed properties
const isWeightUnit = computed(() => ['kg', 'g', 'ltr', 'ml'].includes(form.value.base_unit));

const totalStockAfterRestock = computed(() => {
  const current = parseFloat(stockItemData.value.currentStock || 0);
  const adding = parseFloat(form.value.stock || 0);
  return (current + adding).toFixed(isWeightUnit.value ? 3 : 0);
});

const canSave = computed(() => {
  const hasRequired = form.value.title && form.value.product_code && form.value.category && form.value.regular_price;
  
  if (form.value.has_variants) {
    // If variants enabled, ensure at least one variant with a name
    const hasValidVariants = variants.value.length > 0 && variants.value.some(v => v.variant_name.trim());
    return hasRequired && hasValidVariants;
  }
  
  return hasRequired;
});

// Load stock item data if coming from StockDetails
const loadStockItemData = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromStock = urlParams.get('fromStock');
  
  if (fromStock === 'true') {
    const stockDataStr = sessionStorage.getItem('stockItemForSelling');
    if (stockDataStr) {
      try {
        const stockData = JSON.parse(stockDataStr);
        isRestockMode.value = true;
        stockItemData.value = {
          productId: stockData.productId,
          currentStock: stockData.currentStock,
          title: stockData.title,
          base_unit: stockData.base_unit
        };
        
        // Pre-populate form with stock data
              form.value.title = stockData.title;
        form.value.product_code = stockData.product_code;
        form.value.sku = stockData.sku || '';
        form.value.barcode = stockData.barcode || '';
        form.value.category = stockData.category;
        form.value.base_unit = stockData.base_unit;
        form.value.has_variants = stockData.has_variants;
        form.value.purchased_price = stockData.purchased_price;
        form.value.regular_price = stockData.regular_price;
        form.value.selling_price = stockData.selling_price;
        form.value.discount = stockData.discount || 0;
        form.value.stock = 0; // Reset to 0 for adding new stock
        form.value.vat_applicable = stockData.vat_applicable || false;
        form.value.vat_percent = stockData.vat_percent || 0;
        
        // Clear the session storage after loading
        sessionStorage.removeItem('stockItemForSelling');
        
        console.log('✅ Loaded stock item data for restocking');
      } catch (err) {
        console.error('❌ Failed to parse stock item data', err);
      }
    }
  }
};

// Cancel restock mode
const cancelRestock = () => {
  isRestockMode.value = false;
  stockItemData.value = {
    productId: null,
    currentStock: 0,
    title: '',
    base_unit: 'pcs'
  };
  resetForm();
  router.push('/stock-details');
};

// Load categories on mount
const loadCategories = async () => {
  try {
    const { data } = await api.get("categories/");
    categories.value = data;
  } catch (err) {
    console.error("❌ Failed to fetch categories", err);
  }
};

onMounted(() => {
  loadCategories();
  loadStockItemData();
});

// Generate barcode
const generateBarcode = () => {
  form.value.barcode = "BAR" + Math.floor(100000 + Math.random() * 900000);
};

// Image compression function
const compressImage = (file, targetSize = 300, maxSizeKB = 50, minSizeKB = 15) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate dimensions to fit within target size while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > targetSize) {
            height = Math.round((height * targetSize) / width);
            width = targetSize;
          }
        } else {
          if (height > targetSize) {
            width = Math.round((width * targetSize) / height);
            height = targetSize;
          }
        }
        
        // Set canvas to target size
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetSize, targetSize);
        
        // Draw image centered on canvas
        const x = (targetSize - width) / 2;
        const y = (targetSize - height) / 2;
        ctx.drawImage(img, x, y, width, height);
        
        // Function to convert canvas to blob with specific quality
        const tryQuality = (quality) => {
          return new Promise((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob);
            }, 'image/webp', quality);
          });
        };
        
        // Binary search for optimal quality
        const findOptimalQuality = async () => {
          let quality = 0.85;
          let blob = await tryQuality(quality);
          let sizeKB = blob.size / 1024;
          
          // If too large, reduce quality
          if (sizeKB > maxSizeKB) {
            let low = 0.1;
            let high = quality;
            
            while (high - low > 0.05) {
              quality = (low + high) / 2;
              blob = await tryQuality(quality);
              sizeKB = blob.size / 1024;
              
              if (sizeKB > maxSizeKB) {
                high = quality;
              } else if (sizeKB < minSizeKB) {
                low = quality;
              } else {
                break;
              }
            }
          }
          
          // Final attempt with calculated quality
          blob = await tryQuality(quality);
          sizeKB = blob.size / 1024;
          
          // If still too large, use minimum quality
          if (sizeKB > maxSizeKB) {
            blob = await tryQuality(0.1);
            sizeKB = blob.size / 1024;
          }
          
          return { blob, sizeKB };
        };
        
        findOptimalQuality().then(({ blob, sizeKB }) => {
          // Create a File object from the blob
          const compressedFile = new File([blob], 'product_image.webp', {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          // Create preview URL
          const previewUrl = URL.createObjectURL(blob);
          
          resolve({
            file: compressedFile,
            preview: previewUrl,
            sizeKB: sizeKB.toFixed(1)
          });
        });
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Handle image upload with compression
const onImage = async (e) => {
  const file = e.target.files[0];
  if (!file) {
    imagePreview.value = null;
    compressedImageSize.value = null;
    form.value.image = null;
    return;
  }
  
  try {
    const { file: compressedFile, preview, sizeKB } = await compressImage(file);
    form.value.image = compressedFile;
    imagePreview.value = preview;
    compressedImageSize.value = `${sizeKB} KB`;
    console.log(`✅ Image compressed to ${sizeKB} KB`);
  } catch (error) {
    console.error('❌ Image compression failed:', error);
    alert('Failed to compress image. Please try another image.');
    // Reset the file input
    if (imageInput.value) {
      imageInput.value.value = '';
    }
  }
};

// Variant management
const addVariant = () => {
  variants.value.push({
    variant_name: "",
    sku: "",
    barcode: "",
    purchase_price: null,
    selling_price: null,
    stock: 0,
  });
};

const removeVariant = (index) => {
  variants.value.splice(index, 1);
};

// Add category
const addCategory = async () => {
  if (!newCat.value.trim()) return;
  addingCat.value = true;
  try {
    const { data } = await api.post("categories/", { name: newCat.value.trim() });
    categories.value.unshift(data);
    form.value.category = data.id;
    newCat.value = "";
  } catch (err) {
    console.error("❌ Failed to add category", err);
    alert("❌ Failed to add category: " + (err.response?.data?.detail || err.message));
  } finally {
    addingCat.value = false;
  }
};

// Reset form
const resetForm = () => {
  form.value = {
    title: "",
    product_code: "",
    sku: "",
    barcode: "",
    category: null,
    base_unit: "pcs",
    has_variants: false,
    purchased_price: null,
    regular_price: null,
    selling_price: null,
    discount: 0,
    stock: 0,
    image: null,
    vat_applicable: false,
    vat_percent: 0,
  };
  variants.value = [];
  imagePreview.value = null;
  compressedImageSize.value = null;
  if (imageInput.value) {
    imageInput.value.value = '';
  }
};

// Go back
const goBack = () => {
  router.back();
};

// Submit form
const submitForm = async () => {
  if (!canSave.value) return;
  
  // Validation
  if (form.value.has_variants && variants.value.length === 0) {
    alert("⚠️ Please add at least one variant or uncheck 'has variants'");
    return;
  }
  
  if (form.value.has_variants) {
    const invalidVariants = variants.value.filter(v => !v.variant_name.trim());
    if (invalidVariants.length > 0) {
      alert("⚠️ All variants must have a name");
      return;
    }
  }
  
  loading.value = true;
  
  try {
    let productId;
    
    // Handle restock mode - update existing product
    if (isRestockMode.value && stockItemData.value.productId) {
      console.log("📦 Restocking existing product...");
      
      // Calculate new total stock
      const newTotalStock = parseFloat(stockItemData.value.currentStock) + parseFloat(form.value.stock || 0);
      
      // Prepare FormData for multipart upload (to support image update)
      const formData = new FormData();
      formData.append("stock", newTotalStock);
      formData.append("purchased_price", Number(form.value.purchased_price || 0).toFixed(2));
      formData.append("regular_price", Number(form.value.regular_price || 0).toFixed(2));
      
      if (form.value.selling_price) formData.append("selling_price", Number(form.value.selling_price).toFixed(2));
      if (form.value.discount) formData.append("discount", Number(form.value.discount).toFixed(2));
      
      // Add VAT fields
      formData.append("vat_applicable", form.value.vat_applicable);
      formData.append("vat_percent", Number(form.value.vat_percent || 0).toFixed(2));
      
      // Add image if user uploaded a new one
      if (form.value.image) {
        formData.append("image", form.value.image);
        console.log("📸 Updating product image");
      }
      
      // Add other fields that might have been updated
      if (form.value.barcode) formData.append("barcode", form.value.barcode);
      if (form.value.sku) formData.append("sku", form.value.sku);
      
      await api.patch(`products/${stockItemData.value.productId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      productId = stockItemData.value.productId;
      
      console.log(`✅ Product restocked. New stock: ${newTotalStock}`);
      alert(`✅ Product restocked successfully!\nAdded: ${form.value.stock} ${form.value.base_unit}\nNew Total: ${newTotalStock} ${form.value.base_unit}`);
      
    } else {
      // Normal mode - create new product
      // Prepare form data for multipart upload
      const formData = new FormData();
      
      // Add basic fields
      formData.append("title", form.value.title);
      formData.append("product_code", form.value.product_code);
      if (form.value.sku) formData.append("sku", form.value.sku);
      if (form.value.barcode) formData.append("barcode", form.value.barcode);
      formData.append("category", form.value.category);
      formData.append("base_unit", form.value.base_unit);
      formData.append("has_variants", form.value.has_variants);
      formData.append("purchased_price", Number(form.value.purchased_price || 0).toFixed(2));
      formData.append("regular_price", Number(form.value.regular_price || 0).toFixed(2));
      if (form.value.selling_price) formData.append("selling_price", Number(form.value.selling_price).toFixed(2));
      if (form.value.discount) formData.append("discount", Number(form.value.discount).toFixed(2));
      if (form.value.stock) formData.append("stock", form.value.stock);
      // VAT fields
      formData.append("vat_applicable", form.value.vat_applicable);
      formData.append("vat_percent", Number(form.value.vat_percent || 0).toFixed(2));
      if (form.value.image) formData.append("image", form.value.image);

      console.log("💾 Creating product...");
      const response = await api.post("products/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      productId = response.data.id;
      console.log("✅ Product created with ID:", productId);
    }
    
    // Create variants if has_variants is true and not in restock mode
    if (form.value.has_variants && variants.value.length > 0 && !isRestockMode.value) {
      console.log("💾 Creating variants...");
      const variantPromises = variants.value.map(variant =>
        api.post("product-variants/", {
          product: productId,
          variant_name: variant.variant_name,
          sku: variant.sku || null,
          barcode: variant.barcode || null,
          purchase_price: variant.purchase_price ? Number(variant.purchase_price).toFixed(2) : null,
          selling_price: variant.selling_price ? Number(variant.selling_price).toFixed(2) : null,
          stock: variant.stock || 0,
        })
      );
      
      await Promise.all(variantPromises);
      console.log("✅ All variants created");
    }
    
    if (!isRestockMode.value) {
      alert("✅ Product added successfully!" + (form.value.has_variants ? ` with ${variants.value.length} variant(s)` : ""));
    }
    
    // Reset form
    resetForm();
    isRestockMode.value = false;
    
    // Navigate back
    router.push("/products");
  } catch (error) {
    console.error("❌ Error adding product", error.response?.data || error);
    let errorMsg = "Failed to add product";
    
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
    } else {
      errorMsg += ": " + error.message;
    }
    
    alert("❌ " + errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

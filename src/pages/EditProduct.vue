<template>
  <div class="max-w-5xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">✏️ Edit Product</h2>
      <div class="flex gap-2">
        <button @click="goBack" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded">← Back</button>
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
              type="button"
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

        <!-- VAT Applicable -->
        <div class="md:col-span-2 flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="form.vat_applicable"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-semibold">VAT Applicable</span>
          </label>
          <div v-if="form.vat_applicable" class="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              v-model.number="form.vat_percent"
              class="w-24 border rounded-lg p-2"
              placeholder="0"
            />
            <span class="text-sm text-gray-600">%</span>
          </div>
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-semibold mb-1">Stock</label>
          <input 
            type="number" 
            :step="isWeightUnit ? '0.001' : '1'" 
            :min="0"
            v-model.number="form.stock" 
            class="w-full border rounded-lg p-2" 
            placeholder="0"
          />
          <p class="text-xs text-gray-500 mt-1">In {{ form.base_unit }}</p>
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
          <input type="file" accept="image/*" @change="onImage" />
          <p class="text-xs text-gray-500 mt-1">Recommended: 400x400px, max 50 KB</p>
          
          <div v-if="previewUrl || existingImage" class="relative mt-3 inline-block">
            <img
              :src="previewUrl || existingImage"
              alt="Preview"
              class="h-40 rounded-lg object-cover border"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0.5 hover:bg-red-600"
              title="Remove image"
            >
              ✕
            </button>
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
          <div v-for="(variant, index) in variants" :key="variant.id || `new-${index}`" 
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
                <label class="block text-xs font-semibold mb-1">Stock ({{ form.base_unit }})</label>
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

      <!-- Action buttons -->
      <div class="flex justify-between gap-2 mt-6 pt-6 border-t">
        <button
          class="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          @click="deleteProduct"
          type="button"
        >
          Delete Product
        </button>
        <button
          class="px-6 py-2 rounded-lg text-white"
          :class="canSave ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'"
          :disabled="loading || !canSave"
          @click="updateProduct"
        >
          {{ loading ? "Updating..." : "Update Product" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/axios";

const route = useRoute();
const router = useRouter();

const productId = route.params.id;

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
  vat_applicable: false,
  vat_percent: 0,
});

const variants = ref([]);
const categories = ref([]);
const newCat = ref("");
const addingCat = ref(false);
const loading = ref(false);
const previewUrl = ref("");
const existingImage = ref("");

// Computed properties
const isWeightUnit = computed(() => ['kg', 'g', 'ltr', 'ml'].includes(form.value.base_unit));

const canSave = computed(() => {
  const hasRequired = form.value.title && form.value.product_code && form.value.category && form.value.regular_price;
  
  if (form.value.has_variants) {
    const hasValidVariants = variants.value.length > 0 && variants.value.some(v => v.variant_name.trim());
    return hasRequired && hasValidVariants;
  }
  
  return hasRequired;
});

// Load product data
const loadProduct = async () => {
  try {
    const { data } = await api.get(`/products/${productId}/`);
    
    form.value = {
      title: data.title,
      product_code: data.product_code,
      sku: data.sku || "",
      barcode: data.barcode || "",
      category: data.category?.id || data.category,
      base_unit: data.base_unit || "pcs",
      has_variants: data.has_variants || false,
      purchased_price: data.purchased_price,
      regular_price: data.regular_price,
      selling_price: data.selling_price,
      discount: data.discount || 0,
      stock: data.stock || 0,
      image: null,
      vat_applicable: data.vat_applicable || false,
      vat_percent: data.vat_percent || 0,
    };

    if (data.image) {
      existingImage.value = data.image;
    }

    if (data.variants && data.variants.length > 0) {
      variants.value = data.variants.map(v => ({
        id: v.id,
        variant_name: v.variant_name,
        sku: v.sku || "",
        barcode: v.barcode || "",
        purchase_price: v.purchase_price,
        selling_price: v.selling_price,
        stock: v.stock || 0,
      }));
    }
  } catch (err) {
    console.error("❌ Failed to load product", err);
    alert("Failed to load product details!");
  }
};

// Load categories
const loadCategories = async () => {
  try {
    const { data } = await api.get("/categories/");
    categories.value = data;
  } catch (err) {
    console.error("❌ Failed to fetch categories", err);
  }
};

onMounted(async () => {
  await Promise.all([loadProduct(), loadCategories()]);
});

// Generate barcode
const generateBarcode = () => {
  form.value.barcode = "BAR" + Math.floor(100000 + Math.random() * 900000);
};

// Handle image upload
const onImage = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.image = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  form.value.image = null;
  previewUrl.value = "";
  existingImage.value = "";
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

const removeVariant = async (index) => {
  const variant = variants.value[index];
  
  // If variant has an ID, delete it from backend
  if (variant.id) {
    if (!confirm("⚠️ Are you sure you want to delete this variant?")) return;
    
    try {
      await api.delete(`/product-variants/${variant.id}/`);
      variants.value.splice(index, 1);
      alert("✅ Variant deleted successfully!");
    } catch (err) {
      console.error("❌ Failed to delete variant", err);
      alert("Failed to delete variant!");
    }
  } else {
    // Just remove from array if not saved yet
    variants.value.splice(index, 1);
  }
};

// Add category
const addCategory = async () => {
  if (!newCat.value.trim()) return;
  addingCat.value = true;
  try {
    const { data } = await api.post("/categories/", { name: newCat.value.trim() });
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

// Go back
const goBack = () => {
  router.back();
};

// Delete product
const deleteProduct = async () => {
  if (!confirm("⚠️ Are you sure you want to delete this product? This action cannot be undone.")) return;
  
  try {
    await api.delete(`/products/${productId}/`);
    alert("🗑️ Product deleted successfully!");
    router.push("/products");
  } catch (err) {
    console.error("❌ Delete failed:", err.response?.data || err);
    alert("❌ Failed to delete product!");
  }
};

// Update product
const updateProduct = async () => {
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
    
    // Check for duplicate variant names
    const variantNames = variants.value.map(v => v.variant_name.trim().toLowerCase());
    const uniqueNames = [...new Set(variantNames)];
    if (variantNames.length !== uniqueNames.length) {
      alert("⚠️ Variant names must be unique");
      return;
    }
  }
  
  loading.value = true;
  
  try {
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
    formData.append("vat_applicable", form.value.vat_applicable);
    formData.append("vat_percent", Number(form.value.vat_percent || 0).toFixed(2));
    
    // Handle image
    if (form.value.image) {
      formData.append("image", form.value.image);
    } else if (!existingImage.value) {
      formData.append("image", "");
    }

    console.log("💾 Updating product...");
    await api.patch(`/products/${productId}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    console.log("✅ Product updated");
    
    // Handle variants
    if (form.value.has_variants) {
      console.log("💾 Updating variants...");
      
      // Get existing variant IDs from backend to avoid duplicates
      const existingVariantsRes = await api.get(`/product-variants/?product=${productId}`);
      const existingVariantIds = existingVariantsRes.data.map(v => v.id);
      
      for (const variant of variants.value) {
        const variantData = {
          product: productId,
          variant_name: variant.variant_name,
          sku: variant.sku || null,
          barcode: variant.barcode || null,
          purchase_price: variant.purchase_price ? Number(variant.purchase_price).toFixed(2) : null,
          selling_price: variant.selling_price ? Number(variant.selling_price).toFixed(2) : null,
          stock: variant.stock || 0,
        };
        
        if (variant.id) {
          // Update existing variant
          await api.patch(`/product-variants/${variant.id}/`, variantData);
        } else {
          // Create new variant only if it doesn't already exist
          const existingVariant = existingVariantsRes.data.find(
            ev => ev.variant_name.toLowerCase() === variant.variant_name.toLowerCase()
          );
          
          if (!existingVariant) {
            await api.post("/product-variants/", variantData);
          }
        }
      }
      
      console.log("✅ All variants updated");
    }
    
    alert("✅ Product updated successfully!");
    router.push("/products");
  } catch (error) {
    console.error("❌ Error updating product", error.response?.data || error);
    let errorMsg = "Failed to update product";
    
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

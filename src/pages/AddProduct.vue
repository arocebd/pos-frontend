<template>
  <div class="max-w-5xl mx-auto">
    <div class="bg-white rounded-2xl shadow p-6">
      <h2 class="text-2xl font-bold mb-6">Add Product</h2>

      <!-- 3-col grid on desktop, 1-col on mobile -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium mb-1">Title *</label>
          <input v-model="form.title" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Product Code -->
        <div>
          <label class="block text-sm font-medium mb-1">Product Code *</label>
          <input v-model="form.product_code" class="w-full border rounded-lg p-2" />
        </div>

        <!-- SKU -->
        <div>
          <label class="block text-sm font-medium mb-1">SKU</label>
          <input v-model="form.sku" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Category -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Category *</label>
          <div class="flex gap-2">
            <select v-model="form.category" class="border rounded-lg p-2 flex-1">
              <option disabled value="">-- Select Category --</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <input v-model="newCat" placeholder="New category" class="border rounded-lg p-2 w-44" />
            <button
              class="px-3 py-2 rounded-lg border"
              :disabled="addingCat || !newCat.trim()"
              @click="addCategory"
            >
              {{ addingCat ? "Adding..." : "+ Add" }}
            </button>
          </div>
        </div>

        <!-- Purchase Price -->
        <div>
          <label class="block text-sm font-medium mb-1">Purchased Price *</label>
            <input v-model="form.purchased_price" type="number" step="0.01" class="w-full border rounded-lg p-2" required/>

        </div>
        <!-- Regular Price -->
        <div>
          <label class="block text-sm font-medium mb-1">Regular Price *</label>
          <input type="number" step="0.01" v-model="form.regular_price" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Selling Price -->
        <div>
          <label class="block text-sm font-medium mb-1">Selling Price</label>
          <input type="number" step="0.01" v-model="form.selling_price" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Discount (Flat) -->
        <div>
          <label class="block text-sm font-medium mb-1">Discount (৳)</label>
          <input type="number" step="0.01" v-model="form.discount" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Stock -->
        <div>
          <label class="block text-sm font-medium mb-1">Stock</label>
          <input type="number" v-model.number="form.stock" class="w-full border rounded-lg p-2" />
        </div>

        <!-- Barcode -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium mb-1">Barcode</label>
          <div class="flex gap-2">
            <input v-model="form.barcode" class="border rounded-lg p-2 flex-1" />
            <button class="px-3 py-2 rounded-lg border" @click="generateBarcode">Generate</button>
          </div>
        </div>

        <!-- Product Image -->
        <div class="md:col-span-3">
          <label class="block text-sm font-medium mb-1">Product Image</label>
          <input type="file" accept="image/*" @change="onImage" />
          <p class="text-sm text-gray-500 mt-1">Recommended size: 400x400px and must less than 50 KB</p>
        </div>
      </div>

      <!-- Save button -->
      <div class="flex justify-end mt-6">
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
import api from "@/axios";

const form = ref({
  title: "",
  product_code: "",
  sku: "",
  barcode: "",
  category: "",
  purchased_price: "",
  regular_price: "",
  selling_price: "",
  discount: "",   // 👈 flat discount, matches backend
  stock: 0,
  image: null,
});

const categories = ref([]);
const newCat = ref("");
const addingCat = ref(false);
const loading = ref(false);

// Load categories
const loadCategories = async () => {
  try {
    const { data } = await api.get("categories/");
    categories.value = data;
  } catch (err) {
    console.error("Failed to fetch categories", err);
  }
};

onMounted(loadCategories);

// Generate barcode
const generateBarcode = () => {
  form.value.barcode = "BAR" + Math.floor(100000 + Math.random() * 900000);
};

// Handle image upload
const onImage = (e) => {
  form.value.image = e.target.files[0];
};

// Validation
const canSave = computed(() =>
  form.value.title && form.value.product_code && form.value.category && form.value.regular_price
);

// Add category
const addCategory = async () => {
  if (!newCat.value.trim()) return;
  addingCat.value = true;
  try {
    const { data } = await api.post("categories/", { name: newCat.value.trim() });
    categories.value.unshift(data);
    form.value.category = data.id; // auto-select new one
    newCat.value = "";
  } catch (err) {
    console.error("Failed to add category", err);
  } finally {
    addingCat.value = false;
  }
};

// Submit form
const submitForm = async () => {
  if (!canSave.value) return;
  const formData = new FormData();
  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== "") {
      formData.append(key, form.value[key]);
    }
  }

  loading.value = true;
  try {
    await api.post("products/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("✅ Product added successfully!");
    form.value = {
      title: "",
      product_code: "",
      sku: "",
      barcode: "",
      category: "",
      purchased_price: "",
      regular_price: "",
      selling_price: "",
      discount: "",   // reset
      stock: 0,
      image: null,
    };
  } catch (error) {
    console.error("Error adding product", error.response?.data || error);
    alert("❌ Failed to add product");
  } finally {
    loading.value = false;
  }
};
</script>

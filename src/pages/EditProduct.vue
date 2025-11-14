<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>

    <form @submit.prevent="updateProduct" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-medium mb-1">Product Title *</label>
        <input v-model="form.title" type="text" class="w-full border rounded-lg p-2" required />
      </div>

      <!-- Product Code -->
      <div>
        <label class="block text-sm font-medium mb-1">Product Code *</label>
        <input v-model="form.product_code" type="text" class="w-full border rounded-lg p-2" required />
      </div>

      <!-- SKU -->
      <div>
        <label class="block text-sm font-medium mb-1">SKU</label>
        <input v-model="form.sku" type="text" class="w-full border rounded-lg p-2" />
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium mb-1">Category</label>
        <select v-model="form.category" class="w-full border rounded-lg p-2">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Purchased Price ---->
      <div>
        <label class="block text-sm font-medium mb-1">Purchased Price *</label>
        <input v-model="form.purchased_price" type="number" step="0.01" class="w-full border rounded-lg p-2" required/>
      </div>

      <!-- Regular Price -->
      <div>
        <label class="block text-sm font-medium mb-1">Regular Price *</label>
        <input v-model="form.regular_price" type="number" step="0.01" class="w-full border rounded-lg p-2" required />
      </div>

      <!-- Selling Price -->
      <div>
        <label class="block text-sm font-medium mb-1">Selling Price *</label>
        <input v-model="form.selling_price" type="number" step="0.01" class="w-full border rounded-lg p-2" required />
      </div>

      <!-- Discount -->
      <div>
        <label class="block text-sm font-medium mb-1">Discount</label>
        <input v-model="form.discount" type="number" step="0.01" class="w-full border rounded-lg p-2" />
      </div>

      <!-- Stock -->
      <div>
        <label class="block text-sm font-medium mb-1">Stock Quantity</label>
        <input v-model="form.stock" type="number" class="w-full border rounded-lg p-2" />
      </div>

      <!-- Image Upload -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Product Image</label>
        <input type="file" @change="handleImage" class="w-full border rounded-lg p-2" />

        <div v-if="previewUrl || form.image" class="relative mt-3 inline-block">
          <img
            :src="previewUrl || form.image"
            alt="Preview"
            class="h-40 rounded-lg object-cover border"
          />
          <!-- Remove Image X Button -->
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

      <!-- Buttons -->
      <div class="md:col-span-2 flex justify-between mt-6">
  <button
    type="button"
    @click="goBack"
    class="bg-gray-500 text-white rounded-lg px-6 py-2 hover:bg-gray-600"
  >
    Back
  </button>

  <div class="flex gap-2">
    <!-- ✅ Delete Button -->
    <button
      type="button"
      @click="deleteProduct"
      class="bg-red-600 text-white rounded-lg px-6 py-2 hover:bg-red-700"
    >
      Delete Product
    </button>

    <!-- Update Button -->
    <button
      type="submit"
      class="bg-green-600 text-white rounded-lg px-6 py-2 hover:bg-green-700">
        Update Product
        </button>
    </div>
</div>
      
    </form>
  </div>
</template>

<script>
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "EditProduct",
  data() {
    return {
      form: {
        title: "",
        product_code: "",
        sku: "",
        category: "",
        purchased_price: "",
        regular_price: "",
        selling_price: "",
        discount: "",
        stock: "",
        image: null,
      },
      categories: [],
      previewUrl: "",
      existingImage: "",
    };
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    return { route, router };
  },
  async created() {
    const id = this.route.params.id;
    try {
      // Load product
      const productRes = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
      const data = productRes.data;

      // Ensure category is ID (not object)
      this.form = {
        title: data.title,
        product_code: data.product_code,
        sku: data.sku,
        category: data.category?.id || data.category,
        regular_price: data.regular_price,
        selling_price: data.selling_price,
        discount: data.discount,
        stock: data.stock,
        image: null,
      };
      this.existingImage = data.image;

      // Load categories
      const catRes = await axios.get("http://127.0.0.1:8000/api/categories/");
      this.categories = catRes.data;
    } catch (err) {
      console.error("Error loading product:", err);
      alert("Failed to load product details!");
    }
  },
  methods: {
    handleImage(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.image = file;
        this.previewUrl = URL.createObjectURL(file);
      }
    },
    removeImage() {
      this.form.image = null;
      this.previewUrl = "";
      this.existingImage = "";
    },

    async deleteProduct() {
  if (!confirm("⚠️ Are you sure you want to delete this product?")) return;

  const id = this.route.params.id;

  try {
    await axios.delete(`http://127.0.0.1:8000/api/products/${id}/`);
    alert("🗑️ Product deleted successfully!");
    this.router.push("/products");
  } catch (err) {
    console.error("Delete failed:", err.response?.data || err);
    alert("❌ Failed to delete product!");
  }
},

    async updateProduct() {
      const id = this.route.params.id;
      const formData = new FormData();

      for (const key in this.form) {
        if (this.form[key] !== null && this.form[key] !== undefined && this.form[key] !== "")
          formData.append(key, this.form[key]);
      }

      // if image was removed manually, send blank
      if (this.existingImage === "" && !this.form.image) {
        formData.append("image", "");
      }

      try {
        await axios.patch(`http://127.0.0.1:8000/api/products/${id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product updated successfully!");
        this.router.push("/products");
      } catch (err) {
        console.error("Update failed:", err.response?.data || err);
        alert("❌ Failed to update product!");
      }
    },
    goBack() {
      this.router.back();
    },
  },
};
</script>

<style scoped>
input,
select {
  background-color: #f9fafb;
}
</style>

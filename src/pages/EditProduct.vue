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

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/axios";

const route = useRoute();
const router = useRouter();

// Reactive object to store form data
const form = ref({
    title: "",
    product_code: "",
    sku: "",
    category: "",
    purchased_price: "",
    regular_price: "",
    selling_price: "",
    discount: "",
    stock: "",
    image: null, // Will hold the File object for new uploads
});

// Reactive object to store specific backend validation errors
const errors = reactive({});

const categories = ref([]);
const previewUrl = ref("");
const existingImage = ref(""); // Holds the URL of the image loaded from the server

// ------------------------ LOAD PRODUCT ------------------------
onMounted(async () => {
    const id = route.params.id;
    console.log("Loading product ID:", id);

    try {
        const res = await api.get(`/products/${id}/`);
        const data = res.data;

        form.value = {
            title: data.title,
            product_code: data.product_code,
            sku: data.sku,
            // Use optional chaining for category, defaulting to the ID if structure is flat
            category: data.category?.id || data.category, 
            purchased_price: data.purchased_price,
            regular_price: data.regular_price,
            selling_price: data.selling_price,
            discount: data.discount,
            stock: data.stock,
            image: null, // Ensure new image upload starts clean
        };

        previewUrl.value = data.image;
        existingImage.value = data.image;

        const catRes = await api.get("/categories/");
        categories.value = catRes.data;

    } catch (err) {
        console.error("Load error:", err);
        alert("Failed to load product.");
    }
});

// ------------------------ IMAGE HANDLING ------------------------
function handleImage(event) {
    const file = event.target.files[0];
    if (file) {
        // Clear any existing image error before setting a new file
        if (errors.image) delete errors.image;
        
        form.value.image = file;
        previewUrl.value = URL.createObjectURL(file);
        existingImage.value = "";
    }
}

function removeImage() {
    form.value.image = null;
    previewUrl.value = "";
    existingImage.value = "";
}

// ------------------------ UPDATE PRODUCT ------------------------
async function updateProduct() {
    const id = route.params.id;
    const formData = new FormData();
    
    // Clear previous errors before submitting
    Object.keys(errors).forEach(key => delete errors[key]);

    // Append all fields from the form ref's value
    for (const key in form.value) {
        // Skip null/empty fields unless it's the image (handled separately)
        if (key !== "image" && form.value[key] !== "" && form.value[key] !== null) {
            formData.append(key, form.value[key]);
        }
    }

    // --- IMAGE HANDLING LOGIC ---
    if (form.value.image) {
        // Case 1: New file selected
        formData.append("image", form.value.image); 
    } else if (!existingImage.value) {
        // Case 2: User explicitly removed the existing image
        formData.append("image", ""); 
    }
    // Case 3: existingImage.value is present and form.value.image is null (default) 
    //         --> do nothing, which tells the backend to keep the existing image.

    try {
        await api.patch(`/products/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Product updated successfully!");
        router.push("/products");

    } catch (err) {
        console.error("Update failed:", err.response?.data || err);

        // --- ENHANCED ERROR PARSING ---
        if (err.response && err.response.status === 422 && err.response.data.errors) {
            const backendErrors = err.response.data.errors;

            // Map backend errors to the local reactive errors object
            for (const key in backendErrors) {
                // Ensure the form object key exists to prevent setting errors for unexpected fields
                if (form.value.hasOwnProperty(key)) {
                    // Take the first error message for that field
                    errors[key] = backendErrors[key][0];
                }
            }
            alert(`Update failed: Please check the form for errors.`); 

        } else {
            // Handle network errors, 500 server errors, etc.
            alert("❌ Failed to update product. A server or network error occurred.");
        }
    }
}

// ------------------------ DELETE PRODUCT ------------------------
async function deleteProduct() {
    if (!confirm("Are you sure?")) return;

    const id = route.params.id;
    try {
        await api.delete(`/products/${id}/`);
        alert("Product deleted!");
        router.push("/products");
    } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete product.");
    }
}

function goBack() {
    router.back();
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">All Products</h2>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search product..."
        class="border rounded-lg px-3 py-2 w-64"
      />
    </div>

    <!-- Filters -->
    <div class="flex gap-4 mb-6">
      <select v-model="selectedCategory" class="border rounded-lg px-3 py-2">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <select v-model="sortBy" class="border rounded-lg px-3 py-2">
        <option value="">Sort By</option>
        <option value="price_low">Price: Low → High</option>
        <option value="price_high">Price: High → Low</option>
      </select>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
      >
        <!-- Image -->
        <img
          :src="product.image || 'https://via.placeholder.com/200'"
          alt="product image"
          class="rounded-xl h-40 object-cover mb-3"
        />

        <!-- Product Info -->
        <h3 class="font-semibold text-lg mb-1 truncate">{{ product.title }}</h3>
        <p class="text-gray-500 text-sm mb-1">{{ product.category?.name }}</p>
        <p class="text-gray-600 text-sm mb-1">Code: {{ product.product_code }}</p>
        <p class="text-gray-600 text-sm mb-1">Barcode: {{ product.barcode }}</p>
        <p class="text-gray-600 text-sm mb-2">Stock: {{ product.stock }}</p>
        <p class="text-gray-600 text-sm mb-2">Purchase Price: {{ product.purchased_price }}</p>

        <!-- Price -->
        <div class="mt-auto">
          <p class="font-bold text-lg text-green-600">
            ৳{{ product.selling_price }}
          </p>
          <p v-if="product.discount > 0" class="text-sm text-red-500">
            {{ product.discount }}% OFF
          </p>
        </div>

        <!-- Actions -->
        <button
          @click="editProduct(product.id)"
          class="mt-3 bg-yellow-500 text-white rounded-lg py-2 w-full hover:bg-yellow-600"
        >
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import axios from "../axios";


export default {
  name: "ProductDisplay",
  data() {
    return {
      products: [],
      categories: [],
      searchQuery: "",
      selectedCategory: "",
      sortBy: "",
    };
  },
  setup() {
    const router = useRouter();

    const editProduct = (id) => {
      router.push(`/edit-product/${id}`);
    };

    return { editProduct };
  },
  computed: {
    filteredProducts() {
      let list = [...this.products];

      // Search filter
      if (this.searchQuery) {
        list = list.filter((p) =>
          p.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      // Category filter
      if (this.selectedCategory) {
  const selected = String(this.selectedCategory);

  list = list.filter((p) => {
    // p.category might be: {id: 3, name: "..."} OR 3 OR "3"
    const productCatId =
      typeof p.category === "object" && p.category !== null
        ? String(p.category.id)
        : String(p.category);

    return productCatId === selected;
  });

      // Sorting
      if (this.sortBy === "price_low") {
        list.sort((a, b) => a.selling_price - b.selling_price);
      } else if (this.sortBy === "price_high") {
        list.sort((a, b) => b.selling_price - a.selling_price);
      }

      return list;
    },
  },
  async created() {
    try {
      const productRes = await axios.get("products/");
      this.products = productRes.data;

      const categoryRes = await axios.get("categories/");
      this.categories = categoryRes.data;
    } catch (err) {
      console.error("API Error", err);
    }
  },
};
</script>

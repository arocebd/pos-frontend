<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">All Products</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white p-4 rounded-lg shadow"
      >
        <img
          :src="product.image || 'https://via.placeholder.com/200'"
          class="h-40 w-full object-cover rounded-lg mb-3"
        />

        <h3 class="font-semibold text-lg truncate">{{ product.title }}</h3>
        <p class="text-green-600 font-bold">৳{{ product.selling_price }}</p>

        <!-- Go to product detail -->
        <router-link
          :to="`/products/${product.id}`"
          class="mt-3 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          View
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])

onMounted(async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/products/')
    products.value = res.data
  } catch (err) {
    console.error('Failed to fetch products:', err)
  }
})
</script>

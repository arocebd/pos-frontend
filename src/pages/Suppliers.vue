<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">💼 Supplier Management</h2>
      <button
        @click="showAddModal = true"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        ➕ Add Supplier
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white shadow rounded-lg overflow-x-auto">
      <table class="min-w-full text-sm text-gray-700">
        <thead class="bg-gray-100 uppercase text-xs text-gray-600">
          <tr>
            <th class="px-4 py-2 text-left">#</th>
            <th class="px-4 py-2 text-left">Name</th>
            <th class="px-4 py-2 text-left">Phone</th>
            <th class="px-4 py-2 text-left">Address</th>
            <th class="px-4 py-2 text-left">Opening Balance</th>
            <th class="px-4 py-2 text-right">Total Purchase</th>
            <th class="px-4 py-2 text-right">Total Due</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(supplier, index) in suppliers"
            :key="supplier.id"
            class="border-t hover:bg-gray-50 transition"
          >
            <td class="px-4 py-2">{{ index + 1 }}</td>
            <td class="px-4 py-2 font-medium text-gray-900">{{ supplier.name }}</td>
            <td class="px-4 py-2">{{ supplier.phone || "-" }}</td>
            <td class="px-4 py-2">{{ supplier.address || "-" }}</td>
            <td class="px-4 py-2">৳ {{ supplier.opening_balance || 0 }}</td>
            <td class="px-4 py-2 text-right">৳ {{ supplier.total_purchases || 0 }}</td>
            <td
              class="px-4 py-2 text-right font-semibold"
              :class="supplier.total_due > 0 ? 'text-red-600' : 'text-green-600'"
            >
              ৳ {{ supplier.total_due || 0 }}
            </td>
            <td class="px-4 py-2 text-center space-x-2">
              <button
                @click="goToLedger(supplier.id)"
                class="px-10 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
              Ledger
              </button>
              <button
                @click="goToPurchase(supplier.id)"
                class="px-6 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
              >
              Add Purchase
              </button>
            </td>
          </tr>
          <tr v-if="suppliers.length === 0">
            <td colspan="7" class="text-center py-6 text-gray-500">
              No suppliers found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Supplier Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Add New Supplier</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-semibold">Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border rounded p-2 focus:ring focus:ring-blue-200"
              placeholder="Supplier name"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold">Phone</label>
            <input
              v-model="form.phone"
              type="text"
              class="w-full border rounded p-2 focus:ring focus:ring-blue-200"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold">Address</label>
            <textarea
              v-model="form.address"
              rows="2"
              class="w-full border rounded p-2 focus:ring focus:ring-blue-200"
              placeholder="Address"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold">Opening Balance</label>
            <input
              v-model.number="form.opening_balance"
              type="number"
              class="w-full border rounded p-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="flex justify-end mt-6 space-x-2">
          <button
            @click="showAddModal = false"
            class="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            @click="addSupplier"
            class="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../axios";
import { useRouter } from "vue-router";

const router = useRouter();
const suppliers = ref([]);
const showAddModal = ref(false);

const form = ref({
  name: "",
  phone: "",
  address: "",
  opening_balance: 0,
});

async function fetchSuppliers() {
  try {
    const res = await axios.get("/suppliers/");
    suppliers.value = res.data;
  } catch (err) {
    console.error("❌ Failed to load suppliers:", err);
    alert("Failed to load suppliers.");
  }
}

async function addSupplier() {
  if (!form.value.name.trim()) {
    alert("Please enter supplier name");
    return;
  }

  try {
    const res = await axios.post("/suppliers/", form.value);
    if (res.status === 201) {
      alert("✅ Supplier added successfully!");
      showAddModal.value = false;
      await fetchSuppliers();
      form.value = { name: "", phone: "", address: "", opening_balance: 0 };
    }
  } catch (err) {
    console.error("❌ Failed to add supplier:", err);
    alert("Failed to add supplier. Check console for details.");
  }
}

function goToLedger(id) {
  router.push(`/supplier-ledger/${id}`);
}

function goToPurchase(id) {
  router.push(`/add-purchase?supplier=${id}`);
}

onMounted(fetchSuppliers);
</script>

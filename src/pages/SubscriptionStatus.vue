<template>
  <div class="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded">
    <h2 class="text-xl font-bold mb-4">Subscription Status</h2>

    <div v-if="loading">Loading...</div>

    <div v-else>
      <p><strong>Shop ID:</strong> {{ status.shop_id }}</p>
      <p><strong>Shop Name:</strong> {{ status.shop_name }}</p>
      <p><strong>Plan:</strong> {{ status.plan }}</p>
      <p><strong>Active:</strong> {{ status.is_active ? "Yes" : "No" }}</p>
      <p><strong>Expire Date:</strong> {{ status.expire_date || "N/A" }}</p>

      <div class="mt-4">
        <img
          v-if="status.logo"
          :src="status.logo"
          class="h-20 rounded shadow"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios";

export default {
  name: "SubscriptionStatus",
  data() {
    return {
      status: {},
      loading: true,
    };
  },

  async created() {
    const res = await api.get("/billing/subscription-status/");
    this.status = res.data;
    this.loading = false;
  },
};
</script>

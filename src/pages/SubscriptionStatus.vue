<template>
  <div class="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
    <h2 class="text-3xl font-bold mb-6 text-gray-800">💳 Subscription Management</h2>

    <div v-if="loading" class="text-center py-8">
      <div class="text-gray-500">Loading subscription details...</div>
    </div>

    <div v-else>
      <!-- Shop Info with Logo -->
      <div class="flex items-center gap-6 mb-8 pb-6 border-b">
        <img
          v-if="status.logo"
          :src="`http://localhost:8000${status.logo}`"
          class="h-24 w-24 rounded-lg shadow object-cover"
          alt="Shop Logo"
        />
        <div>
          <h3 class="text-2xl font-bold text-gray-800">{{ status.shop_name }}</h3>
          <p class="text-gray-600">Shop ID: {{ status.shop_id }}</p>
        </div>
      </div>

      <!-- Subscription Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="border rounded-lg p-4 bg-gray-50">
          <p class="text-sm text-gray-600 mb-1">Current Plan</p>
          <p class="text-2xl font-bold text-orange-600 capitalize">{{ status.plan }}</p>
        </div>

        <div class="border rounded-lg p-4 bg-gray-50">
          <p class="text-sm text-gray-600 mb-1">Status</p>
          <p class="text-xl font-semibold" :class="getStatusClass()">
            {{ status.status || 'Unknown' }}
          </p>
        </div>

        <div class="border rounded-lg p-4 bg-gray-50">
          <p class="text-sm text-gray-600 mb-1">Expiry Date</p>
          <p class="text-lg font-semibold">{{ formatDate(status.expire_date) }}</p>
          <p class="text-sm mt-1" :class="getDaysClass()">
            {{ status.days_remaining }} days remaining
          </p>
        </div>

        <div class="border rounded-lg p-4 bg-gray-50">
          <p class="text-sm text-gray-600 mb-1">Monthly Price</p>
          <p class="text-2xl font-bold text-gray-800">৳ {{ status.monthly_price }}</p>
        </div>
      </div>

      <!-- Renewal Options -->
      <div class="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <h4 class="text-xl font-bold text-gray-800 mb-4">Renew Your Subscription</h4>
        <p class="text-sm text-gray-600 mb-6">Choose a plan to extend your subscription. Your remaining days will be added to the new period.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Monthly Plan -->
          <div class="border-2 border-orange-300 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
            <h5 class="text-xl font-bold text-gray-800 mb-2">Monthly Plan</h5>
            <p class="text-3xl font-bold text-orange-600 mb-4">৳ 750<span class="text-sm text-gray-600">/month</span></p>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li>✓ 30 days access</li>
              <li>✓ All features included</li>
              <li>✓ Priority support</li>
            </ul>
            <button
              @click="renewSubscription('monthly')"
              :disabled="renewing"
              class="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {{ renewing ? 'Processing...' : 'Renew Monthly' }}
            </button>
          </div>

          <!-- Yearly Plan -->
          <div class="border-2 border-orange-500 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow relative">
            <span class="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">Best Value</span>
            <h5 class="text-xl font-bold text-gray-800 mb-2">Yearly Plan</h5>
            <p class="text-3xl font-bold text-orange-600 mb-4">৳ 7,990<span class="text-sm text-gray-600">/year</span></p>
            <ul class="text-sm text-gray-600 mb-6 space-y-2">
              <li>✓ 365 days access</li>
              <li>✓ All features included</li>
              <li>✓ Priority support</li>
              <li>✓ Save ৳ 1,010 per year</li>
            </ul>
            <button
              @click="renewSubscription('yearly')"
              :disabled="renewing"
              class="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {{ renewing ? 'Processing...' : 'Renew Yearly' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="mt-6 p-4 rounded-lg" :class="messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
        {{ message }}
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
      renewing: false,
      message: '',
      messageType: 'success'
    };
  },

  async created() {
    await this.loadStatus();
  },

  methods: {
    async loadStatus() {
      try {
        const res = await api.get("/subscription-status/");
        this.status = res.data;
        this.loading = false;
      } catch (err) {
        console.error('Error loading subscription:', err);
        this.message = 'Failed to load subscription status';
        this.messageType = 'error';
        this.loading = false;
      }
    },

    async renewSubscription(plan) {
      try {
        this.renewing = true;
        this.message = '';
        
        const response = await api.post('/renew-subscription/', { plan });
        
        this.message = response.data.message || 'Payment request created successfully!';
        this.messageType = 'success';
        
        // Redirect to payment request page after 2 seconds
        setTimeout(() => {
          this.$router.push('/payment-request');
        }, 2000);
        
      } catch (err) {
        console.error('Error creating payment request:', err);
        this.message = err.response?.data?.detail || 'Failed to create payment request';
        this.messageType = 'error';
      } finally {
        this.renewing = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },

    getStatusClass() {
      const status = this.status.status?.toLowerCase();
      if (status === 'active') return 'text-green-600';
      if (status === 'expired') return 'text-red-600';
      if (status === 'expiring_soon') return 'text-yellow-600';
      return 'text-gray-600';
    },

    getDaysClass() {
      const days = this.status.days_remaining || 0;
      if (days <= 3) return 'text-red-600 font-semibold';
      if (days <= 7) return 'text-yellow-600';
      return 'text-green-600';
    }
  }
};
</script>

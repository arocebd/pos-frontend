<!-- PaymentPending.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full">

      <!-- Loading / Status Icon -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg class="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Payment Verification Pending</h1>
      </div>

      <!-- Shop Info -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-600">Shop ID:</span>
          <span class="font-semibold">{{ shopId }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Plan:</span>
          <span class="font-semibold">{{ planLabel }}</span>
        </div>
      </div>

      <!-- Status Message -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 9 9 0 0118 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="font-medium text-blue-800">Payment Submitted Successfully!</h3>
            <p class="text-sm text-blue-700 mt-1">
              Your payment details have been received. Our admin team is verifying your payment.
              You'll receive an SMS on <strong>{{ phone || 'your number' }}</strong> once verified.
            </p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <button
          @click="checkVerificationStatus"
          :disabled="checkingStatus"
          class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="checkingStatus" class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ checkingStatus ? 'Checking Status...' : 'Check Verification Status' }}
        </button>

        <button
          @click="goToLogin"
          class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Go to Login Page
        </button>
      </div>

      <!-- Support Info -->
      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-600">
          Verification taking too long? Contact support:
          <a href="tel:01791927084" class="text-blue-600 hover:underline font-medium">01791927084</a>
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "@/axios";

export default {
  name: "PaymentPending",

  data() {
    const pending = JSON.parse(localStorage.getItem("payment_pending") || "{}");

    return {
      shopId: this.$route.query.shop_id || pending.shopId || "",
      phone: this.$route.query.phone || pending.phone || localStorage.getItem("reg_phone") || "",
      plan: (this.$route.query.plan || pending.plan || localStorage.getItem("selected_plan") || "")
        .toLowerCase()
        .trim(),

      checkingStatus: false,
      autoCheckInterval: null,
    };
  },

  computed: {
    planLabel() {
      const p = (this.plan || "").toLowerCase().trim();
      if (p === "monthly") return "Monthly";
      if (p === "trial") return "Trial";
      if (p === "yearly") return "Yearly";
      return "Unknown";
    },
  },

  created() {
    if (!this.shopId) {
      this.$router.push("/login");
      return;
    }

    // persist plan/phone for refresh safety
    if (this.plan) localStorage.setItem("selected_plan", this.plan);
    if (this.phone) localStorage.setItem("reg_phone", this.phone);

    // store pending info (includes plan & phone)
    localStorage.setItem(
      "payment_pending",
      JSON.stringify({
        shopId: this.shopId,
        phone: this.phone,
        plan: this.plan,
        timestamp: new Date().toISOString(),
      })
    );

    this.autoCheckInterval = setInterval(() => {
      this.checkVerificationStatus(false);
    }, 30000);
  },

  beforeDestroy() {
    if (this.autoCheckInterval) clearInterval(this.autoCheckInterval);
  },

  methods: {
    async checkVerificationStatus(showMessage = true) {
      this.checkingStatus = true;

      try {
        const { data } = await axios.get(
          `/payment-verification-status/?shop_id=${this.shopId}`
        );

        if (data.is_active) {
          localStorage.removeItem("payment_pending");
          localStorage.removeItem("payment_required");

          if (showMessage) {
            this.$notify({
              title: "Success!",
              text: "Payment verified! You can now login.",
              type: "success",
            });
          }

          setTimeout(() => {
            this.$router.push({
              path: "/login",
              query: { message: "Payment verified successfully! Please login." },
            });
          }, 1500);
        } else if (data.payment_request?.is_verified) {
          if (showMessage) {
            this.$notify({
              title: "Almost There",
              text: "Payment verified! Admin is activating your shop.",
              type: "info",
            });
          }
        } else {
          if (showMessage) {
            this.$notify({
              title: "Still Pending",
              text: "Payment verification is still in progress.",
              type: "info",
            });
          }
        }
      } catch (err) {
        console.error(err);
        if (showMessage) {
          this.$notify({
            title: "Error",
            text: "Failed to check status. Please try again.",
            type: "error",
          });
        }
      } finally {
        this.checkingStatus = false;
      }
    },

    goToLogin() {
      this.$router.push("/login");
    },
  },
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
    <div class="bg-white shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden">
      
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-orange-600 to-yellow-500 p-8 text-white">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-white/20 rounded-full p-4 backdrop-blur-sm animate-pulse">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-center">Payment Verification Pending</h1>
        <p class="text-center text-purple-100 mt-2">Your payment is being verified by our team</p>
      </div>

      <!-- Content Section -->
      <div class="p-8">
        <!-- Shop Info Card -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center">
              <div class="bg-purple-100 rounded-lg p-3 mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-600">Shop ID</p>
                <p class="font-bold text-gray-800 text-lg">{{ shopId }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <div class="bg-blue-100 rounded-lg p-3 mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-600">Subscription Plan</p>
                <p class="font-bold text-gray-800 text-lg">{{ planLabel }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <div class="bg-gradient-to-br from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-4">
              <div class="bg-blue-100 rounded-full p-3">
                <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-blue-900 text-lg mb-2">Payment Submitted Successfully!</h3>
              <p class="text-blue-800 text-sm leading-relaxed">
                Your payment details have been received. Our admin team is verifying your payment.
                You'll receive an SMS on <strong class="text-blue-900">{{ phone || 'your number' }}</strong> once verified.
              </p>
              <div class="mt-4 bg-white rounded-lg p-4 border border-blue-200">
                <p class="text-xs text-blue-700 font-medium mb-2">What happens next:</p>
                <ul class="space-y-2 text-xs text-blue-800">
                  <li class="flex items-start">
                    <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <span>Admin team reviews your payment details</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <span>Payment verification (usually within 5 minutes)</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <span>You'll receive SMS confirmation</span>
                  </li>
                  <li class="flex items-start">
                    <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                    <span>Your shop account will be activated</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 mb-8">
          <button
            @click="checkVerificationStatus"
            :disabled="checkingStatus"
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            <svg v-if="checkingStatus" class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ checkingStatus ? 'Checking Status...' : 'Check Verification Status' }}
          </button>

          <button
            @click="goToLogin"
            class="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Go to Login Page
          </button>
        </div>

        <!-- Support Info -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            <div class="flex-1">
              <h4 class="font-bold text-amber-900 mb-2">Need Help?</h4>
              <p class="text-sm text-amber-800 mb-3">
                If verification is taking longer than expected or you have any questions, feel free to contact our support team:
              </p>
              <div class="flex items-center space-x-4">
                <a href="tel:01791927084" class="inline-flex items-center px-4 py-2 bg-white border-2 border-amber-400 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-semibold">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  Call: 01685253524 or whatsapp
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Auto-refresh notice -->
        <div class="mt-6 text-center">
          <p class="text-xs text-gray-500 flex items-center justify-center">
            <svg class="w-4 h-4 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Auto-checking status every 30 seconds
          </p>
        </div>
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
      if (p === "monthly") return "Monthly Plan";
      if (p === "trial") return "Trial Plan";
      if (p === "yearly") return "Yearly Plan";
      return "Unknown Plan";
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

    // Auto-check every 30 seconds
    this.autoCheckInterval = setInterval(() => {
      this.checkVerificationStatus(false);
    }, 30000);
  },

  beforeUnmount() {
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
            alert("✅ Payment verified! You can now login.");
          }

          setTimeout(() => {
            this.$router.push({
              path: "/login",
              query: { message: "Payment verified successfully! Please login." },
            });
          }, 1500);
        } else if (data.payment_request?.is_verified) {
          if (showMessage) {
            alert("⏳ Payment verified! Admin is activating your shop.");
          }
        } else {
          if (showMessage) {
            alert("⏳ Payment verification is still in progress.");
          }
        }
      } catch (err) {
        console.error(err);
        if (showMessage) {
          alert("❌ Failed to check status. Please try again.");
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

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>

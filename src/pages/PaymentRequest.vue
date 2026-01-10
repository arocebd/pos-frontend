<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
    <div class="bg-white shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden">
      
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-green-600 to-blue-600 p-8 text-white">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-white/20 rounded-full p-4 backdrop-blur-sm">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-center">Payment Verification</h1>
        <p class="text-center text-green-100 mt-2">Submit your payment details for verification</p>
      </div>

      <!-- Form Section -->
      <div class="p-8">
        <!-- Shop Info Card -->
        <div class="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-600 mb-1">Shop ID</p>
              <p class="font-bold text-gray-800 text-lg">{{ shopId }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">Phone Number</p>
              <p class="font-bold text-gray-800 text-lg">{{ phone }}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6 flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span>{{ success }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Payment Instructions -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
          <div class="flex items-start mb-4">
            <svg class="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
            </svg>
            <div>
              <h3 class="font-bold text-amber-900 text-lg mb-2">💳 Send Payment First</h3>
              <p class="text-amber-800 text-sm mb-4">Please send your subscription payment to one of the accounts below:</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white border-2 border-pink-300 rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-2">
                <div class="bg-pink-100 rounded-lg p-2 mr-3">
                  <svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-600">bKash (Merchant)</p>
                  <p class="text-xl font-bold text-pink-600">01791927084</p>
                </div>
              </div>
              <p class="text-xs text-gray-600 mt-2">Use "Payment" option</p>
            </div>
            
            <div class="bg-white border-2 border-orange-300 rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div class="flex items-center mb-2">
                <div class="bg-orange-100 rounded-lg p-2 mr-3">
                  <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-600">Nagad (Personal)</p>
                  <p class="text-xl font-bold text-orange-600">01791927084</p>
                </div>
              </div>
              <p class="text-xs text-gray-600 mt-2">Use "Send Money" option</p>
            </div>
          </div>

          <div class="bg-amber-100 border border-amber-300 rounded-lg p-3">
            <p class="text-xs text-amber-900">
              <strong>⚠️ Important:</strong> After sending payment, fill out the form below with your payment details.
            </p>
          </div>
        </div>

        <!-- Payment Form -->
        <form @submit.prevent="submitPayment" class="space-y-6">
          
          <!-- Payment Method -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Payment Method <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label 
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                  paymentMethod === 'bkash' 
                    ? 'border-pink-500 bg-pink-50 shadow-md' 
                    : 'border-gray-200 hover:border-pink-300'
                ]"
              >
                <input type="radio" v-model="paymentMethod" value="bkash" class="sr-only">
                <div class="flex items-center">
                  <div class="flex-shrink-0 mr-3">
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      paymentMethod === 'bkash' ? 'border-pink-500' : 'border-gray-300'
                    ]">
                      <div v-if="paymentMethod === 'bkash'" class="w-3 h-3 rounded-full bg-pink-500"></div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800">bKash</p>
                    <p class="text-xs text-gray-600">Mobile Banking</p>
                  </div>
                </div>
              </label>

              <label 
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                  paymentMethod === 'nagad' 
                    ? 'border-orange-500 bg-orange-50 shadow-md' 
                    : 'border-gray-200 hover:border-orange-300'
                ]"
              >
                <input type="radio" v-model="paymentMethod" value="nagad" class="sr-only">
                <div class="flex items-center">
                  <div class="flex-shrink-0 mr-3">
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      paymentMethod === 'nagad' ? 'border-orange-500' : 'border-gray-300'
                    ]">
                      <div v-if="paymentMethod === 'nagad'" class="w-3 h-3 rounded-full bg-orange-500"></div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800">Nagad</p>
                    <p class="text-xs text-gray-600">Mobile Banking</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Subscription Amount <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 gap-4">
              <label 
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                  amount === '750' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300'
                ]"
              >
                <input type="radio" v-model="amount" value="750" class="sr-only">
                <div class="text-center">
                  <p class="text-2xl font-bold text-blue-600">৳750</p>
                  <p class="text-sm text-gray-600 mt-1">Monthly Plan</p>
                </div>
                <div v-if="amount === '750'" class="absolute top-2 right-2">
                  <div class="bg-blue-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </label>

              <label 
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
                  amount === '7990' 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-purple-300'
                ]"
              >
                <input type="radio" v-model="amount" value="7990" class="sr-only">
                <div class="text-center">
                  <p class="text-2xl font-bold text-purple-600">৳7990</p>
                  <p class="text-sm text-gray-600 mt-1">Yearly Plan</p>
                  <span class="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full mt-1">
                    Save 11%
                  </span>
                </div>
                <div v-if="amount === '7990'" class="absolute top-2 right-2">
                  <div class="bg-purple-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Sender Last 4 Digits -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Last 4 Digits of Sender Number <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input 
                v-model="senderLast4" 
                maxlength="4" 
                placeholder="e.g., 1234"
                pattern="[0-9]{4}"
                class="input-modern pl-12 text-center text-xl font-bold tracking-widest"
                required
              />
              <svg class="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
            </div>
            <p class="text-xs text-gray-600 mt-2 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
              Enter the last 4 digits of the mobile number you used to send payment
            </p>
          </div>

          <!-- Transaction ID (Optional) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Transaction ID <span class="text-gray-500 text-xs">(Optional)</span>
            </label>
            <div class="relative">
              <input 
                v-model="transactionId" 
                placeholder="Transaction ID from SMS confirmation"
                class="input-modern pl-10"
              />
              <svg class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p class="text-xs text-gray-600 mt-2">You'll receive this in the SMS confirmation after successful payment</p>
          </div>

          <!-- Screenshot Upload -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              Payment Screenshot <span class="text-gray-500 text-xs">(Optional but recommended)</span>
            </label>
            
            <div v-if="!previewImage" class="relative">
              <label class="flex flex-col items-center justify-center w-full h-40 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-blue-400 hover:bg-blue-50">
                <span class="flex flex-col items-center space-y-3">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-sm text-gray-600 text-center">
                    <span class="font-semibold text-blue-600">Click to upload screenshot</span>
                    <br/>
                    <span class="text-xs">PNG, JPG up to 5MB</span>
                  </span>
                </span>
                <input type="file" @change="handleFile" accept="image/*" class="hidden" />
              </label>
            </div>

            <div v-else class="relative">
              <div class="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                <img :src="previewImage" class="w-full h-48 object-contain rounded-lg" />
                <button 
                  type="button" 
                  @click="clearImage"
                  class="mt-3 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Remove Screenshot
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-600 mt-2">Upload a screenshot for faster payment verification</p>
          </div>

          <!-- Submit Button -->
          <div class="pt-6 border-t">
            <button 
              type="submit" 
              class="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-lg"
              :disabled="loading || !paymentMethod || !amount || !senderLast4"
            >
              <svg v-if="loading" class="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span v-if="loading">Submitting Payment...</span>
              <span v-else>Submit Payment Details</span>
            </button>
            
            <p class="text-center text-sm text-gray-600 mt-4">
              After submission, you'll receive an SMS confirmation once verified
            </p>
          </div>
        </form>

        <!-- Back Link -->
        <div class="mt-6 text-center">
          <button 
            @click="$router.go(-1)"
            class="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios";

export default {
  name: "PaymentRequest",

  data() {
    return {
      paymentMethod: "",
      amount: "",
      senderLast4: "",
      transactionId: "",
      file: null,
      previewImage: null,

      loading: false,
      success: null,
      error: null,

      shopId: this.$route.query.shop_id || "",
      phone: this.$route.query.phone || "",
      plan: (this.$route.query.plan || localStorage.getItem("selected_plan") || "").toLowerCase().trim(),
    };
  },

  methods: {
    handleFile(e) {
      const f = e.target.files?.[0];
      if (!f) return;
      this.file = f;
      this.previewImage = URL.createObjectURL(f);
    },

    clearImage() {
      if (this.previewImage) URL.revokeObjectURL(this.previewImage);
      this.previewImage = null;
      this.file = null;
    },

    async submitPayment() {
      console.log("=== SUBMITTING PAYMENT ===");
      console.log("Form values:", {
        shopId: this.shopId,
        amount: this.amount,
        senderLast4: this.senderLast4,
        paymentMethod: this.paymentMethod,
        transactionId: this.transactionId,
        hasFile: !!this.file
      });

      const formData = new FormData();
      formData.append("shop_id", this.shopId);
      formData.append("amount", this.amount);
      formData.append("sender_last4", this.senderLast4);
      formData.append("method", this.paymentMethod);
      
      if (this.transactionId) {
        formData.append("transaction_id", this.transactionId);
      }
      
      if (this.file) {
        formData.append("screenshot", this.file);
      }
      
      // Log FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      this.loading = true;
      this.error = null;
      this.success = null;

      try {
        const response = await api.post("/payment-request/", formData, {
          headers: { 
            "Content-Type": "multipart/form-data" 
          },
          timeout: 30000
        });

        console.log("Payment submission successful:", response.data);
        
        this.success = "✅ Payment details submitted successfully! Redirecting...";

        setTimeout(() => {
          this.$router.push({
            path: '/payment-pending',
            query: { 
              shop_id: this.shopId,
              phone: this.phone,
              plan: this.plan
            }
          });
        }, 2000);

      } catch (err) {
        console.error("Payment submission error:", err);
        console.error("Error response:", err.response?.data);
        
        if (err.response?.data) {
          if (err.response.data.detail) {
            this.error = err.response.data.detail;
          } else if (err.response.data.errors) {
            this.error = "Validation error: " + Object.values(err.response.data.errors).flat().join(", ");
          } else if (err.response.data.message) {
            this.error = err.response.data.message;
          } else {
            this.error = JSON.stringify(err.response.data);
          }
        } else if (err.message) {
          this.error = err.message;
        } else {
          this.error = "Failed to submit payment details. Please try again.";
        }
        
        window.scrollTo(0, 0);
      } finally {
        this.loading = false;
      }
    },
  },

  beforeUnmount() {
    if (this.previewImage) URL.revokeObjectURL(this.previewImage);
  },
};
</script>

<style scoped>
.input-modern {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none;
}

.input-modern:focus {
  @apply shadow-lg;
}
</style>

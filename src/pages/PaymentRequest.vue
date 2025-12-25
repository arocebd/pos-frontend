<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
      <h2 class="text-2xl font-bold mb-4 text-center">Payment Verification</h2>

      <!-- Shop Info -->
      <div class="bg-gray-50 p-4 rounded mb-6">
        <p class="text-sm text-gray-600">Shop ID: <strong>{{ shopId }}</strong></p>
        <p class="text-sm text-gray-600">Phone: <strong>{{ phone }}</strong></p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="bg-green-100 text-green-800 p-3 rounded mb-4">
        {{ success }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-100 text-red-800 p-3 rounded mb-4">
        {{ error }}
      </div>

      <p class="text-gray-700 mb-4">
        Please enter the payment details below. After submission, our admin team will verify your payment and send you an SMS.
      </p>

      <form @submit.prevent="submitPayment">
        <!-- Payment Method -->
        <div class="mb-4">
          <label class="block font-medium mb-2">Payment Method *</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input type="radio" v-model="paymentMethod" value="bkash" class="mr-2">
              <span>bKash</span>
            </label>
            <label class="flex items-center">
              <input type="radio" v-model="paymentMethod" value="nagad" class="mr-2">
              <span>Nagad</span>
            </label>
          </div>
        </div>

        <!-- Amount -->
        <div class="mb-4">
          <label class="block font-medium">Amount (BDT) *</label>
          <select v-model="amount" class="input" required>
            <option value="" disabled>Select Amount</option>
            <option value="750">Monthly - 750 BDT</option>
            <option value="7990">Yearly - 7990 BDT</option>
          </select>
        </div>

        <!-- Sender Last 4 Digits -->
        <div class="mb-4">
          <label class="block font-medium">Last 4 digits of Sender Number *</label>
          <input 
            v-model="senderLast4" 
            maxlength="4" 
            placeholder="Last 4 digits"
            class="input" 
            required
          />
          <p class="text-xs text-gray-500 mt-1">Enter last 4 digits of the mobile number from which you sent payment</p>
        </div>

        <!-- Transaction ID (Optional) -->
        <div class="mb-4">
          <label class="block font-medium">Transaction ID (Optional)</label>
          <input 
            v-model="transactionId" 
            placeholder="Transaction ID from SMS"
            class="input"
          />
        </div>

        <!-- Screenshot (Optional) -->
        <div class="mb-4">
          <label class="block font-medium">Payment Screenshot (Optional)</label>
          <input type="file" @change="handleFile" accept="image/*" class="input-file" />
          <p class="text-xs text-gray-500 mt-1">Upload screenshot of successful payment for faster verification</p>
          
          <!-- Preview -->
          <div v-if="previewImage" class="mt-3">
            <p class="text-sm font-medium mb-2">Preview:</p>
            <img :src="previewImage" class="max-w-full h-40 object-contain rounded border" />
            <button 
              type="button" 
              @click="clearImage"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="text-center mt-6">
          <button 
            type="submit" 
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold w-full"
            :disabled="loading || !paymentMethod || !amount || !senderLast4"
          >
            <span v-if="loading">
              <svg class="animate-spin h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Submitting...
            </span>
            <span v-else>Submit Payment Details</span>
          </button>
          
          <p class="text-sm text-gray-600 mt-4">
            After submission, please wait for SMS confirmation before trying to login.
          </p>
        </div>
      </form>

      <!-- Back Button -->
      <div class="mt-6 text-center">
        <button 
          @click="$router.go(-1)"
          class="text-blue-600 hover:text-blue-800"
        >
          ← Back to Registration
        </button>
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
    last4: "",
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

  // Test with a simple fetch first
  const testData = new FormData();
  testData.append("shop_id", this.shopId);
  testData.append("amount", this.amount);
  testData.append("sender_last4", this.senderLast4);
  testData.append("method", this.paymentMethod);
  
  if (this.transactionId) {
    testData.append("transaction_id", this.transactionId);
  }
  
  if (this.file) {
    testData.append("screenshot", this.file);
  }
  
  // Log FormData contents
  console.log("FormData contents:");
  for (let pair of testData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  this.isSubmitting = true;
  this.error = null;
  this.success = null;
  this.validationErrors = [];

  try {
    const response = await api.post("/payment-request/", testData, {
      headers: { 
        "Content-Type": "multipart/form-data" 
      },
      timeout: 30000
    });

    console.log("Payment submission successful:", response.data);
    
    this.success = "✅ Thanks for your payment. Please wait for verification. You will get a confirmation message on your registered phone number.";

    setTimeout(() => {
      this.$router.push({
        name: "RegistrationSuccess",
        query: { 
          requires_payment: true, 
          shop_id: this.shopId,
          phone: this.phone,
          plan: this.plan
        }
      });
    }, 3000);

  } catch (err) {
    console.error("Payment submission error:", err);
    console.error("Error response:", err.response?.data);
    
    if (err.response?.data) {
      if (err.response.data.errors) {
        // Handle serializer validation errors
        this.validationErrors = Object.values(err.response.data.errors).flat();
        this.error = "Please fix the validation errors below.";
      } else if (err.response.data.detail) {
        this.error = err.response.data.detail;
      } else if (err.response.data.message) {
        this.error = err.response.data.message;
      } else if (err.response.data.error) {
        this.error = err.response.data.error;
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
    this.isSubmitting = false;
  }
},
  },
  beforeUnmount() {
    if (this.previewImage) URL.revokeObjectURL(this.previewImage);
  },
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <!-- Registration Card -->
    <div class="bg-white shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden">
      
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-yellow-400 to-orange-600 p-8 text-white">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-white/20 rounded-full p-4 backdrop-blur-sm">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-center">Register Your Shop</h1>
        <p class="text-center text-blue-100 mt-2">Start your POS journey with us today!</p>
      </div>

      <!-- Form Section -->
      <div class="p-8">
        <!-- SUCCESS -->
        <div v-if="success" class="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6 flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
          </svg>
          <span>{{ success }}</span>
        </div>

        <!-- ERROR -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6 flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
          </svg>
          <span>{{ error }}</span>
        </div>

        <form @submit.prevent="registerShop">
          <!-- Shop & Owner Information -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Shop Information
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Shop Name -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Shop Name <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.shop_name" 
                  required 
                  type="text" 
                  placeholder="Enter your shop name"
                  class="input-modern"
                />
              </div>

              <!-- Owner Name -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Owner Name <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.owner_name" 
                  required 
                  type="text" 
                  placeholder="Enter owner name"
                  class="input-modern"
                />
              </div>

              <!-- Phone -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Phone Number <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.phone" 
                  required 
                  type="text" 
                  placeholder="01XXXXXXXXX"
                  class="input-modern"
                />
              </div>

              <!-- Location -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Location</label>
                <input 
                  v-model="form.location" 
                  type="text" 
                  placeholder="Shop address"
                  class="input-modern"
                />
              </div>

              <!-- Email / Link -->
              <div class="space-y-2 md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">
                  Email / Website / Facebook Link
                </label>
                <input 
                  v-model="form.email_or_link" 
                  type="text" 
                  placeholder="example@email.com or facebook.com/yourpage"
                  class="input-modern"
                />
              </div>
            </div>
          </div>

          <!-- Account Credentials -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Account Credentials
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Username -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Username <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.username" 
                  required 
                  type="text" 
                  placeholder="Choose a username"
                  class="input-modern"
                />
              </div>

              <!-- Password -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">
                  Password <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.password" 
                  required 
                  type="password" 
                  placeholder="Create a strong password"
                  class="input-modern"
                />
              </div>
            </div>
          </div>

          <!-- Shop Logo -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Shop Logo (Optional)
            </h3>
            <div class="flex items-start space-x-4">
              <div class="flex-1">
                <label class="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none">
                  <span class="flex flex-col items-center space-y-2">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <span class="text-sm text-gray-600">
                      <span class="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </span>
                    <span class="text-xs text-gray-500">PNG, JPG up to 2MB</span>
                  </span>
                  <input type="file" @change="handleLogo" class="hidden" accept="image/*" />
                </label>
              </div>
              <div v-if="previewLogo" class="flex-shrink-0">
                <div class="relative">
                  <img :src="previewLogo" class="h-32 w-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm" />
                  <button 
                    type="button" 
                    @click="clearLogo"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Subscription Plan -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              Choose Your Plan <span class="text-red-500">*</span>
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Trial Plan -->
              <div 
                @click="form.subscription_plan = 'trial'"
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200',
                  form.subscription_plan === 'trial' 
                    ? 'border-green-500 bg-green-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                ]"
              >
                <div class="text-center">
                  <div class="flex justify-center mb-3">
                    <div class="bg-green-100 rounded-full p-3">
                      <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                  </div>
                  <h4 class="font-bold text-lg text-gray-800">Trial</h4>
                  <div class="my-3">
                    <span class="text-3xl font-bold text-green-600">FREE</span>
                  </div>
                  <p class="text-sm text-gray-600">7 Days Free</p>
                  <div class="mt-4 space-y-2 text-xs text-gray-600">
                    <p>✓ All Features</p>
                    <p>✓ No Payment Required</p>
                    <p>✓ Instant Activation</p>
                  </div>
                </div>
                <div v-if="form.subscription_plan === 'trial'" class="absolute top-2 right-2">
                  <div class="bg-green-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Monthly Plan -->
              <div 
                @click="form.subscription_plan = 'monthly'"
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200',
                  form.subscription_plan === 'monthly' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                ]"
              >
                <div class="text-center">
                  <div class="flex justify-center mb-3">
                    <div class="bg-blue-100 rounded-full p-3">
                      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <h4 class="font-bold text-lg text-gray-800">Monthly</h4>
                  <div class="my-3">
                    <span class="text-3xl font-bold text-blue-600">৳750</span>
                    <span class="text-sm text-gray-600">/month</span>
                  </div>
                  <p class="text-sm text-gray-600">Best for new shops</p>
                  <div class="mt-4 space-y-2 text-xs text-gray-600">
                    <p>✓ All Features</p>
                    <p>✓ 30 Days Access</p>
                    <p>✓ Quick Setup</p>
                  </div>
                </div>
                <div v-if="form.subscription_plan === 'monthly'" class="absolute top-2 right-2">
                  <div class="bg-blue-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Yearly Plan -->
              <div 
                @click="form.subscription_plan = 'yearly'"
                :class="[
                  'relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200',
                  form.subscription_plan === 'yearly' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105' 
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                ]"
              >
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span class="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    SAVE 11%
                  </span>
                </div>
                <div class="text-center">
                  <div class="flex justify-center mb-3">
                    <div class="bg-purple-100 rounded-full p-3">
                      <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                      </svg>
                    </div>
                  </div>
                  <h4 class="font-bold text-lg text-gray-800">Yearly</h4>
                  <div class="my-3">
                    <span class="text-3xl font-bold text-purple-600">৳7990</span>
                    <span class="text-sm text-gray-600">/year</span>
                  </div>
                  <p class="text-sm text-gray-600">Best Value</p>
                  <div class="mt-4 space-y-2 text-xs text-gray-600">
                    <p>✓ All Features</p>
                    <p>✓ 365 Days Access</p>
                    <p>✓ Priority Support</p>
                  </div>
                </div>
                <div v-if="form.subscription_plan === 'yearly'" class="absolute top-2 right-2">
                  <div class="bg-purple-500 rounded-full p-1">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Instructions -->
          <div
            v-if="form.subscription_plan === 'monthly' || form.subscription_plan === 'yearly'"
            class="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg mb-6"
          >
            <div class="flex items-start">
              <svg class="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
              <div class="flex-1">
                <h3 class="font-bold text-amber-900 mb-3 text-lg">💳 Payment Instructions</h3>
                <p class="text-amber-800 mb-4">Send the subscription fee to one of the following accounts:</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div class="bg-white rounded-lg p-4 border border-amber-200">
                    <p class="text-sm font-medium text-gray-700">bKash (Merchant)</p>
                    <p class="text-2xl font-bold text-pink-600">01791927084</p>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-amber-200">
                    <p class="text-sm font-medium text-gray-700">Nagad (Personal)</p>
                    <p class="text-2xl font-bold text-orange-600">01791927084</p>
                  </div>
                </div>

                <div class="bg-amber-100 rounded-lg p-3 border border-amber-300">
                  <p class="text-sm text-amber-900">
                    <strong>⚠️ Important:</strong> After registration, you'll need to submit the <strong>last 4 digits of sender number</strong> for payment verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Register Button -->
          <div class="flex items-center justify-between pt-6 border-t">
            <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium text-sm">
              ← Already have an account?
            </a>
            <button
              type="submit"
              class="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span v-if="loading">Registering...</span>
              <span v-else>
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Register Shop
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios";

export default {
  name: "Registration",

  data() {
    return {
      loading: false,
      error: null,
      success: null,

      form: {
        shop_name: "",
        owner_name: "",
        phone: "",
        location: "",
        email_or_link: "",
        username: "",
        password: "",
        subscription_plan: "",
      },

      logoFile: null,
      previewLogo: null,
    };
  },

  methods: {
    handleLogo(event) {
      this.logoFile = event.target.files[0];
      if (this.logoFile) {
        this.previewLogo = URL.createObjectURL(this.logoFile);
      }
    },

    clearLogo() {
      if (this.previewLogo) {
        URL.revokeObjectURL(this.previewLogo);
      }
      this.logoFile = null;
      this.previewLogo = null;
    },

async registerShop() {
  this.loading = true;
  this.error = null;
  this.success = null;

  try {
    const formData = new FormData();

    for (let key in this.form) {
      formData.append(key, this.form[key]);
    }

    if (this.logoFile) {
      formData.append("logo", this.logoFile);
    }

    console.log("Sending registration request...");
    const res = await api.post("/auth/register-shop/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Registration successful!");
    console.log("Response data:", res.data);
    console.log("requires_payment value:", res.data.requires_payment);
    console.log("Shop ID:", res.data.shop_id);
    console.log("Plan:", res.data.plan);
    
    // Check if payment is required
    if (res.data.requires_payment === true || res.data.plan !== "trial") {
      console.log("Payment required - redirecting to payment page");
      
      const queryParams = {
        shop_id: res.data.shop_id,
        phone: this.form.phone,
        plan: res.data.plan,
        amount: res.data.plan === "monthly" ? "299" : "2499"
      };
      
      console.log("Redirecting with params:", queryParams);
      
      // Use router.push with path
      this.$router.push({
        path: '/payment-request',
        query: queryParams
      });
      
    } else {
      console.log("Trial plan - redirecting to success page");
      this.$router.push({
        path: '/registration-success',
        query: {
          requires_payment: false,
          phone: this.form.phone,
          shop_id: res.data.shop_id,
          plan: res.data.plan
        }
      });
    }
    
  } catch (err) {
    console.error("❌ Registration error:", err);
    console.log("Error response:", err.response?.data);
    if (err.response?.data) {
      this.error = typeof err.response.data === 'string' 
        ? err.response.data 
        : JSON.stringify(err.response.data);
    } else {
      this.error = "Registration failed. Please try again.";
    }
  } finally {
    this.loading = false;
  }
},
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
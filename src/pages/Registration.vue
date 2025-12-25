<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
      <h2 class="text-2xl font-bold text-center mb-6">Register Your Shop</h2>

      <!-- SUCCESS -->
      <div v-if="success" class="bg-green-100 text-green-800 p-3 rounded mb-4">
        {{ success }}
      </div>

      <!-- ERROR -->
      <div v-if="error" class="bg-red-100 text-red-800 p-3 rounded mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="registerShop">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Shop Name -->
          <div>
            <label class="font-medium">Shop Name *</label>
            <input v-model="form.shop_name" required type="text" class="input" />
          </div>

          <!-- Owner Name -->
          <div>
            <label class="font-medium">Owner Name *</label>
            <input v-model="form.owner_name" required type="text" class="input" />
          </div>

          <!-- Phone -->
          <div>
            <label class="font-medium">Phone *</label>
            <input v-model="form.phone" required type="text" class="input" />
          </div>

          <!-- Location -->
          <div>
            <label class="font-medium">Location</label>
            <input v-model="form.location" type="text" class="input" />
          </div>

          <!-- Email / Link -->
          <div>
            <label class="font-medium">Email / Website / Facebook Link</label>
            <input v-model="form.email_or_link" type="text" class="input" />
          </div>

          <!-- Username -->
          <div>
            <label class="font-medium">Username *</label>
            <input v-model="form.username" required type="text" class="input" />
          </div>

          <!-- Password -->
          <div>
            <label class="font-medium">Password *</label>
            <input v-model="form.password" required type="password" class="input" />
          </div>

          <!-- Shop Logo -->
          <div class="md:col-span-2">
            <label class="font-medium">Shop Logo (Optional)</label>
            <input type="file" @change="handleLogo" class="input-file" />
            <p v-if="previewLogo" class="mt-2 text-sm text-gray-600">
              Preview:
            </p>
            <img
              v-if="previewLogo"
              :src="previewLogo"
              class="h-20 mt-1 rounded shadow"
            />
          </div>

          <!-- Subscription Plan -->
          <div class="md:col-span-2">
            <label class="font-medium">Choose Subscription Plan *</label>
            <select v-model="form.subscription_plan" required class="input">
              <option value="" disabled>Select Plan</option>
              <option value="trial">7 Days Free Trial</option>
              <option value="monthly">Monthly - 750 BDT</option>
              <option value="yearly">Yearly - 7990 BDT</option>
            </select>
          </div>
        </div>

        <!-- Payment Instructions -->
        <div
          v-if="form.subscription_plan === 'monthly' || form.subscription_plan === 'yearly'"
          class="bg-yellow-100 text-yellow-800 p-4 rounded mt-4"
        >
          <h3 class="font-bold mb-2">Payment Instructions</h3>

          <p>Send the subscription fee to the following accounts:</p>

          <ul class="mt-2 space-y-1">
            <li><strong>bKash:</strong> 01791927084</li>
            <li><strong>Nagad:</strong> 01791927084</li>
          </ul>

          <p class="mt-2 text-sm">
            After registration, you will submit the last 4 digits of sender number
            for payment verification.
          </p>
        </div>

        <!-- Register Button -->
        <div class="text-center mt-6">
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            :disabled="loading"
          >
            <span v-if="loading">Registering...</span>
            <span v-else>Register Shop</span>
          </button>
        </div>
      </form>
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
      this.previewLogo = URL.createObjectURL(this.logoFile);
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
.input {
  @apply w-full px-3 py-2 border rounded-md mt-1;
}
.input-file {
  @apply mt-1;
}
</style>
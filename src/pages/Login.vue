<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Canvas for animated background -->
    <canvas 
      ref="canvas" 
      class="absolute inset-0 w-full h-full"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    ></canvas>
    
    <!-- Overlay gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-900/40 to-purple-900/20"></div>
    
    <!-- Login Card -->
    <div class="bg-white/100 backdrop-blur-sm shadow-2xl rounded-2xl p-8 w-full max-w-md z-10 relative border border-white/10">
      <!-- Logo/Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
          POS System
        </h1>
        <p class="text-gray-600 mt-2">Welcome back! Please sign in to continue</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="font-semibold text-red-800">Login Failed</p>
            <p class="text-red-700 text-sm mt-1">{{ error }}</p>
            
            <!-- Show specific actions for subscription errors -->
            <div v-if="subscriptionError" class="mt-3 flex gap-2">
              <button 
                @click="goToPayment" 
                class="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Complete Payment
              </button>
              <button 
                @click="checkStatus" 
                class="text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start">
        <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span class="text-green-800">{{ success }}</span>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
            <input
              v-model="username"
              type="text"
               class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-blue-50"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <input
              v-model="password"
              type="password"
               class="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-blue-50"
              placeholder="Enter password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-red-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          :disabled="loading"
        >
          <span v-if="loading">
            <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Logging in...
          </span>
          <span v-else class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Login
          </span>
        </button>

        <div class="text-center pt-4 border-t border-gray-200">
          <router-link 
            to="/registration" 
            class="text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Don't have an account? Register
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from "@/axios";

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      error: null,
      success: null,
      subscriptionError: false,
      subscriptionData: null,
      canvas: null,
      ctx: null,
      dots: [],
      mouse: {
        x: 0,
        y: 0,
        radius: 100
      },
      animationFrameId: null
    };
  },

  mounted() {
    this.initCanvas();
    this.createDots();
    this.animate();
    
    // Check for query parameters
    if (this.$route.query.success) {
      this.success = this.$route.query.success;
    }
    
    if (this.$route.query.registered === 'true') {
      this.success = "Registration successful! You can now login.";
    }
    
    if (this.$route.query.payment_submitted === 'true') {
      this.success = "Payment submitted! Please wait for admin verification.";
    }
    
    // Check if redirected from payment request
    if (this.$route.query.error) {
      this.error = this.$route.query.error;
      this.subscriptionError = true;
      this.subscriptionData = {
        shop_id: this.$route.query.shop_id,
        plan: this.$route.query.plan,
        error_code: this.$route.query.error_code
      };
    }
  },

  beforeUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },

  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      
      // Set canvas size
      this.resizeCanvas();
      
      // Handle window resize
      window.addEventListener('resize', this.resizeCanvas);
    },

    resizeCanvas() {
      const parent = this.canvas.parentElement;
      this.canvas.width = parent.clientWidth;
      this.canvas.height = parent.clientHeight;
      
      // Recreate dots with new dimensions
      this.createDots();
    },

    createDots() {
      this.dots = [];
      const dotCount = Math.floor((this.canvas.width * this.canvas.height) / 8000); // Adjust density
      
      for (let i = 0; i < dotCount; i++) {
        this.dots.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.3})` // Blue with varying opacity
        });
      }
    },

    handleMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    },

    handleMouseLeave() {
      this.mouse.x = 0;
      this.mouse.y = 0;
    },

    animate() {
      // Clear canvas with slight fade effect
      this.ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update and draw dots
      this.dots.forEach(dot => {
        // Calculate distance from mouse
        const dx = this.mouse.x - dot.x;
        const dy = this.mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse interaction
        if (distance < this.mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          dot.x -= Math.cos(angle) * force * 10;
          dot.y -= Math.sin(angle) * force * 10;
        }
        
        // Bounce off edges
        if (dot.x <= 0 || dot.x >= this.canvas.width) dot.speedX *= -1;
        if (dot.y <= 0 || dot.y >= this.canvas.height) dot.speedY *= -1;
        
        // Update position
        dot.x += dot.speedX;
        dot.y += dot.speedY;
        
        // Keep within bounds
        dot.x = Math.max(0, Math.min(this.canvas.width, dot.x));
        dot.y = Math.max(0, Math.min(this.canvas.height, dot.y));
        
        // Draw dot
        this.ctx.beginPath();
        this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        this.ctx.fillStyle = dot.color;
        this.ctx.fill();
        
        // Draw connections between nearby dots
        this.dots.forEach(otherDot => {
          const dx = dot.x - otherDot.x;
          const dy = dot.y - otherDot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(dot.x, dot.y);
            this.ctx.lineTo(otherDot.x, otherDot.y);
            this.ctx.stroke();
          }
        });
      });
      
      this.animationFrameId = requestAnimationFrame(this.animate);
    },

    fillCredentials(username, password) {
      this.username = username;
      this.password = password;
      console.log(`Filled credentials: ${username}`);
    },

    async login() {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Username:", this.username);
      
      this.loading = true;
      this.error = null;
      this.success = null;
      this.subscriptionError = false;
      this.subscriptionData = null;

      try {
        const response = await api.post("/auth/login/", {
          username: this.username,
          password: this.password
        });

        console.log("Login response:", response.data);
        
        // Store tokens
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        
        // Store user info
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        
        // Store shop info
        if (response.data.shop) {
          localStorage.setItem("shop", JSON.stringify(response.data.shop));
          localStorage.setItem("shop_status", response.data.shop.is_active ? "active" : "inactive");
        }
        
        console.log("Tokens saved to localStorage");
        
        // Check if shop is active
        if (response.data.shop && !response.data.shop.is_active) {
          // Redirect to payment page
          this.$router.push({
            name: "PaymentRequest",
            query: {
              shop_id: response.data.shop.shop_id,
              plan: response.data.shop.plan,
              error: "Subscription required to access the system"
            }
          });
          return;
        }
        
        // Success - redirect to dashboard
        this.$router.push("/dashboard");

      } catch (error) {
        console.error("=== LOGIN ERROR ===");
        console.error("Error:", error);
        console.error("Error response:", error.response);
        
        if (error.response) {
          const { status, data } = error.response;
          
          if (status === 400) {
            // Bad request - invalid credentials
            this.error = data.detail || "Invalid username or password.";
            
          } else if (status === 402) {
            // Payment required - subscription inactive
            this.error = data.detail || "Subscription required.";
            this.subscriptionError = true;
            this.subscriptionData = data;
            
            // Store for payment page
            localStorage.setItem("pending_shop_id", data.shop_id);
            localStorage.setItem("pending_shop_plan", data.plan);
            
          } else if (status === 401) {
            // Unauthorized
            this.error = "Invalid credentials. Please try again.";
            
          } else if (status === 500) {
            // Server error
            this.error = "Server error. Please try again later.";
            
          } else {
            // Other errors
            this.error = data.detail || `Login failed (Status: ${status})`;
          }
          
        } else if (error.request) {
          // No response received
          console.error("No response received:", error.request);
          this.error = "No response from server. Check your internet connection.";
          
        } else if (error.message) {
          // Other errors
          console.error("Error message:", error.message);
          this.error = error.message;
          
        } else {
          this.error = "An unknown error occurred.";
        }
        
      } finally {
        this.loading = false;
      }
    },

    goToPayment() {
      let shopId = this.subscriptionData?.shop_id || localStorage.getItem("pending_shop_id");
      
      if (shopId) {
        this.$router.push({
          name: "PaymentRequest",
          query: {
            shop_id: shopId,
            plan: this.subscriptionData?.plan,
            error: this.subscriptionData?.detail
          }
        });
      } else {
        this.error = "Shop ID not found. Please try registering again.";
      }
    },

    checkStatus() {
      const shopId = this.subscriptionData?.shop_id || localStorage.getItem("pending_shop_id");
      if (shopId) {
        this.$router.push({
          name: "RegistrationSuccess",
          query: {
            shop_id: shopId,
            requires_payment: true
          }
        });
      }
    }
  }
};
</script>

<style scoped>
/* Smooth transitions */
* {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
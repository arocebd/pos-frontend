<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
    <div class="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Al Zabeer POS</h1>
        <p class="text-gray-500 text-sm">Sign in to continue</p>
      </div>

      <form @submit.prevent="login">
        <label class="block mb-3">
          <span class="text-gray-700 text-sm">Username</span>
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            class="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
        </label>

        <label class="block mb-4">
          <span class="text-gray-700 text-sm">Password</span>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            class="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
          <div class="mt-2 flex items-center gap-2">
            <input id="showpass" type="checkbox" v-model="showPassword" />
            <label for="showpass" class="text-sm text-gray-600">Show password</label>
          </div>
        </label>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
        >
          <span v-if="!loading">Login</span>
          <span v-else>Logging in…</span>
        </button>

        <p v-if="error" class="text-red-600 text-sm mt-3 text-center">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios"

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://163.227.239.93/api", // Adjust if your API is at different base
  timeout: 10000,
})

export default {
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      showPassword: false,
      loading: false,
      error: null,
    }
  },
  created() {
    const token = localStorage.getItem("access") || localStorage.getItem("token")
    if (token) {
      this.$router.replace("/dashboard")
    }
  },
  methods: {
    async login() {
      this.error = null
      this.loading = true

      try {
        // Try different possible login endpoints
        const endpoints = [
          "/auth/login/",
          "/login/", 
          "/token/",
          "/api-token-auth/",
          "/auth/token/"
        ]

        let response = null
        let lastError = null

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            response = await api.post(endpoint, {
              username: this.username,
              password: this.password,
            })
            break // Stop if successful
          } catch (err) {
            lastError = err
            console.log(`Endpoint ${endpoint} failed:`, err.response?.status)
            continue // Try next endpoint
          }
        }

        if (!response) {
          throw lastError || new Error("No valid login endpoint found")
        }

        console.log("Login response:", response.data)

        // Handle different response formats
        const access = response.data.access || response.data.token || response.data.access_token
        const refresh = response.data.refresh || response.data.refresh_token

        // Store user data
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: response.data.username || response.data.user?.username || this.username,
            avatarUrl: response.data.avatar_url || response.data.user?.avatar_url || "",
          })
        )

        if (access) {
          localStorage.setItem("access", access)
          // Also store as token for compatibility
          localStorage.setItem("token", access)
        }
        if (refresh) {
          localStorage.setItem("refresh", refresh)
        }

        this.$router.replace("/dashboard")
      } catch (e) {
        console.error("Login error details:", e)
        console.error("Response data:", e.response?.data)
        console.error("Status:", e.response?.status)
        
        if (e?.response?.status === 401) {
          this.error = "Invalid username or password."
        } else if (e?.response?.status === 400) {
          this.error = e.response.data.detail || "Invalid request."
        } else if (e?.response?.status === 404) {
          this.error = "Login endpoint not found. Please check API configuration."
        } else {
          this.error = "Login failed. Please try again."
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

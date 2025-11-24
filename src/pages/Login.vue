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

// For Vite, env vars are on import.meta.env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://163.227.239.93/api",
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
    const token = localStorage.getItem("access")
    if (token) {
      // Already logged in
      this.$router.replace("/dashboard").catch(() => {})
    }
  },

  methods: {
    async login() {
      if (!this.username.trim() || !this.password.trim()) {
        this.error = "Please enter both username and password."
        return
      }

      this.error = null
      this.loading = true

      try {
        const { data } = await api.post("/auth/login/", {
          username: this.username.trim(),
          password: this.password,
        })

        console.log("Login response data:", data)

        // Support multiple possible response formats
        const access =
          data.access || data.token || data.access_token || data.key
        const refresh = data.refresh || data.refresh_token || null

        if (!access) {
          // We got 200 but no token – show the raw data for debugging
          console.warn("No access token in response:", data)
          this.error = "Unexpected response from server."
          return
        }

        // Save tokens
        localStorage.setItem("access", access)
        if (refresh) {
          localStorage.setItem("refresh", refresh)
        }
        localStorage.setItem(
          "user",
          JSON.stringify({ username: this.username.trim() })
        )

        // Try router navigation first
        try {
          await this.$router.replace("/dashboard")
        } catch (navErr) {
          console.error("Router error, falling back to hard redirect:", navErr)
          // Fallback – full page reload
          window.location.href = "/dashboard"
        }
      } catch (error) {
        console.error("Login error:", error)
        console.error("Response:", error.response?.data)

        if (error.code === "ECONNABORTED") {
          this.error = "Request timeout. Please try again."
        } else if (error.response?.status === 401) {
          this.error = "Invalid username or password."
        } else if (error.response?.status >= 500) {
          this.error = "Server error. Please try again later."
        } else if (error.request) {
          this.error = "Network error. Please check your connection."
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

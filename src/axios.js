// axios.js
import axios from "axios";
import router from "@/router";

// ✅ Django backend URL
const baseURL = "https://pos.khotiyan.com/api/";

const instance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for auth token
instance.interceptors.request.use(
  (config) => {
    // Try both 'access' and 'token' keys for backward compatibility
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    console.log(`📝 Headers:`, config.headers);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and error handling
instance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response [${response.status}]:`, response.config.url);
    if (response.config.url.includes('/auth/login/')) {
      console.log("Login response received");
    }
    return response;
  },
  async (error) => {
    console.error("❌ API Error Details:");
    console.error("- URL:", error.config?.url);
    console.error("- Method:", error.config?.method);
    console.error("- Status:", error.response?.status);
    console.error("- Data:", error.response?.data);
    console.error("- Message:", error.message);
    
    const originalRequest = error.config;
    const response = error.response;
    
    // Handle network errors (no response)
    if (!response) {
      console.error("⚠️ Network error - No response from server");
      return Promise.reject({
        message: "Cannot connect to server. Please check your internet connection.",
        isNetworkError: true,
        originalError: error
      });
    }
    
    // Handle 402 - Payment Required
    if (response.status === 402) {
      console.log("💰 Payment required detected");
      const errorData = response.data || {};
      
      // Store payment info
      localStorage.setItem('payment_required', JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString()
      }));
      
      // Clear auth tokens since subscription is inactive
      localStorage.removeItem("access");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      
      // Redirect to payment page
      router.push({
        name: 'PaymentRequest',
        query: {
          shop_id: errorData.shop_id,
          plan: errorData.plan,
          error: errorData.detail || "Subscription required",
          error_code: errorData.error_code
        }
      });
      
      return Promise.reject(new Error('Subscription required'));
    }
    
    // Handle 401 - Unauthorized
    if (response.status === 401) {
      console.log("🔐 Unauthorized - clearing tokens");
      localStorage.removeItem("access");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      localStorage.removeItem("shop");
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        router.push('/login');
      }
    }
    
    // Handle 404 - Not Found
    if (response.status === 404) {
      console.error("🔍 Endpoint not found:", error.config.url);
      return Promise.reject({
        message: `API endpoint not found: ${error.config.url}`,
        status: 404,
        originalError: error
      });
    }
    
    // Handle 500 - Server Error
    if (response.status >= 500) {
  console.error("🔥 Server error");

  return Promise.reject({
    message: response.data?.detail || response.data?.message || "Server error",
    status: response.status,
    data: response.data,            
    response: response,              
    url: error.config?.url,              
    method: error.config?.method,        
    originalError: error
  });
}
    
    // For other errors, return the original error
    return Promise.reject(error);
  }
);

// Helper function to check subscription status
export const checkSubscriptionStatus = async () => {
  try {
    const token = localStorage.getItem("access") || localStorage.getItem("token");
    if (!token) return { isActive: false, requiresLogin: true };
    
    const response = await instance.get("/subscription-status/");
    return response.data;
  } catch (error) {
    console.error("Subscription status check failed:", error);
    return { 
      isActive: false, 
      error: error.message,
      requiresPayment: error.response?.status === 402 
    };
  }
};

// Helper function to handle payment verification
export const submitPaymentRequest = async (paymentData) => {
  try {
    const formData = new FormData();
    
    // Append all payment data
    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== null && paymentData[key] !== undefined) {
        formData.append(key, paymentData[key]);
      }
    });
    
    const response = await instance.post("/payment-request/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Payment submission failed:", error);
    throw error;
  }
};

export default instance;

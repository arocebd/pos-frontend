import axios from "axios";

// লোকাল + প্রোডাকশন দুটো কভার করবে
const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 ${config.method?.toUpperCase()} -> ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;

// Add response interceptor for debugging
instance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default instance;

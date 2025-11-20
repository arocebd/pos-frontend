import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://163.227.239.93/api/";

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

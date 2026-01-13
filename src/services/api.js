import axios from "axios";

const api = axios.create({
  baseURL: "https://163.227.239.93/api/",   // Django backend
});

export default api;

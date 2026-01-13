import axios from "axios";

const api = axios.create({
  baseURL: "https://pos.khotiyan.com/api/",   // Django backend
});

export default api;

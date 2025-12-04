// src/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 15000,
});

let navigateFunction = null;
export function setNavigate(fn) {
  navigateFunction = fn;
}

// Attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("mabel_access");
    if (access) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 → redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mabel_access");
      localStorage.removeItem("mabel_refresh");

      if (navigateFunction) {
        setTimeout(() => navigateFunction("/login"), 0);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

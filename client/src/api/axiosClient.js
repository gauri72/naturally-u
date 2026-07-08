import axios from 'axios';

// Single shared axios instance - all API calls go through here so
// base URL, credentials, and error interceptors live in one place.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // sends the httpOnly JWT cookie
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized: log every failed request in dev for easier debugging
    if (import.meta.env.DEV) {
      console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

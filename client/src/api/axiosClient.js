import axios from 'axios';

// Single shared axios instance - all API calls go through here so
// base URL, credentials, and error interceptors live in one place.
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // harmless fallback for same-site/local dev; prod auth uses the Bearer token below
});

// Cross-origin deploys (client and API on different onrender.com subdomains) make the
// auth cookie third-party, which browsers now block by default. Attach the JWT from
// the login response as a Bearer header instead so auth works regardless of cookie policy.
//
// Shopper (customer) and admin sessions are separate: customer endpoints
// and placing an order get the customer token, everything else the admin
// one. Keeping the customer token off public reads also lets the PWA keep
// caching those for offline use (it skips requests carrying a token).
const usesCustomerToken = (config) =>
  config.url?.startsWith('/customers')
  || (config.url === '/orders' && config.method === 'post');

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(usesCustomerToken(config) ? 'customerToken' : 'adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getMyProfile, loginCustomer, registerCustomer, googleSignIn, updateMyProfile, changeMyPassword, resetPassword,
} from '../api/customer.api';

// Storefront shopper session - separate from AuthContext (admin). The JWT
// lives in localStorage under 'customerToken' and is sent as a Bearer
// header by axiosClient on /customers requests and when placing an order.
const STORAGE_KEY = 'customerToken';
const CustomerContext = createContext(null);

const readToken = () => {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(() => !!readToken());

  const startSession = useCallback(({ token, customer: profile }) => {
    localStorage.setItem(STORAGE_KEY, token);
    setCustomer(profile);
    return profile;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomer(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!readToken()) return null;
    try {
      const res = await getMyProfile();
      setCustomer(res.data);
      return res.data;
    } catch {
      logout(); // expired, or signed out by a password change elsewhere
      return null;
    }
  }, [logout]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const value = {
    customer,
    loading,
    login: async (data) => startSession((await loginCustomer(data)).data),
    register: async (data) => startSession((await registerCustomer(data)).data),
    loginWithGoogle: async (credential) => startSession((await googleSignIn(credential)).data),
    resetPassword: async (data) => startSession((await resetPassword(data)).data),
    changePassword: async (data) => startSession((await changeMyPassword(data)).data),
    updateProfile: async (data) => {
      const res = await updateMyProfile(data);
      setCustomer(res.data);
      return res.data;
    },
    refresh,
    logout,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export const useCustomer = () => useContext(CustomerContext);

import { CookieManager } from "@/utils/cookie-utils";
import axios from "axios";
// import { CookieManager } from "./cookie-utils"; // Import your CookieManager utility

export const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001/api/v1';
export const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY;
// export const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY;

export default function initAxios() {
  // Set the base URL and ensure credentials are handled correctly
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = false;

  const accessToken = CookieManager.get("travodate-token");

  // Set authorization header if token exists (using CookieManager)
  if (typeof window !== "undefined") {
    if (accessToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Global response interceptor for handling 401 errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log("error", error)
      if (error?.response?.status === 401) {
        // Handle unauthorized access
        if (typeof window !== "undefined") {
          // Clear the auth token cookie
          CookieManager.delete("travodate-token", "/");
          CookieManager.delete("travodate-refresh-token", "/");
          CookieManager.delete("travodate-user", "/");

          // Clear local storage
          localStorage.clear();

          // Clear the axios auth header
          delete axios.defaults.headers.common.Authorization;

          // Redirect to home
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );
}

// Helper functions for auth token management
export const setAuthToken = (token: string) => {
  // Set cookie with 7 day expiration
  CookieManager.set("travodate-token", token, {
    expires: 7,
    path: "/",
    secure: true,
    sameSite: "Strict",
    // httpOnly: true,

  });
  // Set axios header
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};
export const setAuthUser = (token: string) => {

  CookieManager.set("travodate-user", token, {
    expires: 7,
    path: "/",
    secure: true,
    sameSite: "Strict",
    // httpOnly: true
  });
  // Set axios header
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  CookieManager.delete("travodate-token", "/");
  CookieManager.delete("travodate-user", "/");
  window.location.reload()
  delete axios.defaults.headers.common.Authorization;
};

export const getAuthToken = (): string | null => {
  return CookieManager.get("travodate-token");
}

export const getAuthUser = (): string | null => {
  return CookieManager.get("travodate-user");
};

initAxios();
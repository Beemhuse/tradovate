import { CookieManager } from "@/utils/cookie-utils";
import axios from "axios";
// import { CookieManager } from "./cookie-utils"; // Import your CookieManager utility

export const API_URL =
  import.meta.env.VITE_BASE_UR || "http://localhost:9991/api/v1";
export const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY;
// export const API_KEY = import.meta.env.NEXT_PUBLIC_API_KEY;

export default function initAxios() {
  // Set the base URL and ensure credentials are handled correctly
  axios.defaults.baseURL = API_URL;
  axios.defaults.withCredentials = false;

  const accessToken = CookieManager.get("tradovate-token");

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
      console.log("error", error);
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message?.includes("invalid token")
      ) {
        // Handle unauthorized access
        if (typeof window !== "undefined") {
          // Clear the auth token cookie
          CookieManager.delete("tradovate-token", "/");
          CookieManager.delete("tradovate-refresh-token", "/");
          CookieManager.delete("tradovate-user", "/");

          // Clear the axios auth header
          delete axios.defaults.headers.common.Authorization;

          // Redirect to home
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    },
  );
}

// Helper functions for auth token management
export const setAuthToken = (token: string) => {
  // Set cookie with 7 day expiration
  CookieManager.set("tradovate-token", token, {
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
  CookieManager.set("tradovate-user", token, {
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
  CookieManager.delete("tradovate-token", "/");
  CookieManager.delete("tradovate-user", "/");
  window.location.reload();
  delete axios.defaults.headers.common.Authorization;
};

export const getAuthToken = (): string | null => {
  return CookieManager.get("tradovate-token");
};

export const getAuthUser = (): string | null => {
  return CookieManager.get("tradovate-user");
};

initAxios();

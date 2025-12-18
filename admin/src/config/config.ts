import { CookieManager } from "@/utils/cookie-utils";

export const API_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:5000/api/v1";

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = CookieManager.get("agro-token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle fetch responses
export const handleFetchResponse = async (response: Response) => {
  // Handle 401 unauthorized
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      CookieManager.delete("agro-token");
      CookieManager.delete("agro-user");
      // Optionally redirect to login
      // window.location.href = "/auth";
    }
  }

  // Parse response
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || `HTTP error! status: ${response.status}`
    );
  }

  return data;
};

// Helper functions for auth token management
export const setAuthToken = (token: string) => {
  CookieManager.set("agro-token", token, {
    expires: 7,
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
};

export const setAuthUser = (user: any) => {
  const userStr = typeof user === "string" ? user : JSON.stringify(user);
  CookieManager.set("agro-user", userStr, {
    expires: 7,
    path: "/",
    secure: true,
    sameSite: "Strict",
  });
};

export const clearAuthToken = () => {
  CookieManager.delete("agro-token", "/");
  CookieManager.delete("agro-user", "/");
  if (typeof window !== "undefined") {
    window.location.reload();
  }
};

export const getAuthToken = (): string | null => {
  return CookieManager.get("agro-token");
};

export const getAuthUser = (): string | null => {
  return CookieManager.get("agro-user");
};

export const getStoredUser = (): any | null => {
  const userStr = CookieManager.get("agro-user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

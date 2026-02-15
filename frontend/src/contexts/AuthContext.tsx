import { useEffect, useState, useCallback } from "react";
import { CookieManager } from "@/utils/cookie-utils";
import { setAuthToken } from "@/config/config";
import { fetchData } from "../config/api";
import { AUTH } from "../hooks/apiEndpoint";

export const useAuth = () => {
  const [user, setUserState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------- Init ---------------- */
  useEffect(() => {
    try {
      const storedUser = CookieManager.get("tradovate-user");
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to parse stored user", err);
      CookieManager.delete("tradovate-user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------- User ---------------- */
  const setUser = useCallback((user: any) => {
    if (!user) return;
    CookieManager.set("tradovate-user", JSON.stringify(user), {
      expires: 7,
      path: "/",
      sameSite: "Strict",
      secure: import.meta.env.PROD,
    });

    setUserState(user);
  }, []);

  const removeUser = useCallback(() => {
    // Clear all cookies
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Clear local storage
    localStorage.clear();

    CookieManager.delete("tradovate-user", "/");
    CookieManager.delete("tradovate-refresh-token", "/");

    setAuthToken(null); // clear axios header
    setUserState(null);
  }, []);

  /* ---------------- Tokens ---------------- */
  const setCookies = useCallback((accessToken: string, refreshToken: string) => {
    setAuthToken(accessToken);

    CookieManager.set("tradovate-refresh-token", refreshToken, {
      expires: 7,
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
  }, []);

  const refetch = useCallback(async () => {
    try {
      const response = await fetchData(AUTH.ME);
      if (response) {
        setUser(response);
      }
    } catch (err) {
      console.error("Failed to refetch user data", err);
    }
  }, [setUser]);

  return {
    user,
    isLoading,
    setLoading: setIsLoading,
    setUser,
    removeUser,
    setCookies,
    refetch,
  };
};

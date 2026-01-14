import { useEffect, useState } from "react";
import { CookieManager } from "@/utils/cookie-utils";
import { setAuthToken } from "@/config/config";

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
  const setUser = (user: any) => {
    CookieManager.set("tradovate-user", JSON.stringify(user), {
      expires: 7,
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });

    setUserState(user);
  };

  const removeUser = () => {
    CookieManager.delete("tradovate-user");
    CookieManager.delete("tradovate-refresh-token");

    setAuthToken(null); // clear axios header
    setUserState(null);
  };

  /* ---------------- Tokens ---------------- */
  const setCookies = (accessToken: string, refreshToken: string) => {
    setAuthToken(accessToken);

    CookieManager.set("tradovate-refresh-token", refreshToken, {
      expires: 7,
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    });
  };

  return {
    user,
    isLoading,
    setLoading: setIsLoading,
    setUser,
    removeUser,
    setCookies,
  };
};

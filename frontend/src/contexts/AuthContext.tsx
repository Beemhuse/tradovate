import { useEffect, useState } from "react";
import { CookieManager } from "@/utils/cookie-utils";
import { setAuthToken } from "@/config/config";

export const useAuth = () => {
  const [user, updateUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = CookieManager.get("tradovate-user");
    if (storedUser) {
      updateUser(JSON.parse(storedUser) || null);
    }
    setLoading(false);
  }, []);

  const setUser = (user: any) => {
    CookieManager.set("tradovate-user", JSON.stringify(user), {
      expires: 7,
      path: "/",
      secure: true,
      sameSite: "Strict",
      httpOnly: true,
    });
    updateUser(user)
  }
  const removeUser = () => {
    CookieManager.delete("tradovate-user");
    updateUser(null)
  };
  const setLoading = (loading: boolean) => setIsLoading(loading);

  const setCookies = (accessToken: string, refreshToken: string) => {
    setAuthToken(accessToken);
    CookieManager.set("travodate-refresh-token", refreshToken, {
      expires: 7,
      path: "/",
      secure: true,
      sameSite: "Strict",
      httpOnly: true,
    });
  }

  return {
    user,
    setUser,
    removeUser,
    isLoading,
    setLoading,
    setCookies
  };
};

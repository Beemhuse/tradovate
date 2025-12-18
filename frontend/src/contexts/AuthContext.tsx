import { useEffect, useState } from "react";
import { CookieManager } from "@/utils/cookie-utils";

export const useAuth = () => {
  const [user, updateUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      updateUser(JSON.parse(storedUser) || null);
    }
    setLoading(false);
  }, []);

  const setUser = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user))
    updateUser(user)
  }
  const removeUser = () => {
    localStorage.removeItem("user")
    updateUser(null)
  };
  const setLoading = (loading: boolean) => setIsLoading(loading);

  const setCookies = (accessToken: string, refreshToken: string) => {
    CookieManager.set("travodate-token", accessToken, {
      expires: 7,
      path: "/",
      secure: true,
      sameSite: "Strict",
      httpOnly: true,
    });
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

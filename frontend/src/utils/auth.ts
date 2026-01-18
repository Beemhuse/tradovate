import { CookieManager } from "./cookie-utils";

export const isAuthenticated = () => {
  return !!CookieManager.get("tradovate-token");
};

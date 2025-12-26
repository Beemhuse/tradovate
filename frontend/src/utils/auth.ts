import { CookieManager } from "./cookie-utils";

export const isAuthenticated = () => {
  return !!CookieManager.get("travodate-token");
};

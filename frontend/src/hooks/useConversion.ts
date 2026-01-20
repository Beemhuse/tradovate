import { useState, useCallback } from "react";
import { COINS } from "./apiEndpoint";
import { CookieManager } from "@/utils/cookie-utils";

/* ----------------------------------
   TYPES
---------------------------------- */

export interface ConversionResult {
  success: boolean;
  mode: "single" | "portfolio";

  // single conversion
  fromCoinId?: string;
  toCoinId?: string;
  amount?: number;
  conversionRate?: number;
  convertedAmount?: number;
  fromPrice?: number;
  toPrice?: number;

  // portfolio conversion
  baseCoinId?: string;
  totalValue?: number;
  wallets?: Array<{
    walletId: string;
    coinId: string;
    balance: number;
    price: number;
    conversionRate: number;
    convertedAmount: number;
    convertedToCoinId: string;
  }>;
}

/* ----------------------------------
   HOOK
---------------------------------- */

export const useConversion = () => {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = CookieManager.get("tradovate-token");
  const BASE_URL =
    import.meta.env.VITE_BASE_UR || "http://localhost:9991/api/v1";

  /* ----------------------------------
     PREVIEW CONVERSION (GET)
  ---------------------------------- */
  const convertCoin = useCallback(
    async (
      fromCoinId?: string,
      toCoinId?: string,
      amount?: number
    ): Promise<ConversionResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (fromCoinId) params.append("coinId", fromCoinId);
        if (toCoinId) params.append("toCoinId", toCoinId);
        if (amount !== undefined)
          params.append("amount", amount.toString());

        const response = await fetch(
          `${BASE_URL}${COINS.CONVERSIONS}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Conversion preview failed");
        }

        setResult(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /* ----------------------------------
     EXECUTE CONVERSION (POST)
  ---------------------------------- */
  const executeConversion = useCallback(
    async (payload: {
      fromCoinId: string;
      toCoinId: string;
      amount: number;
    }): Promise<{ success: boolean; message?: string; error?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}${COINS.CONVERSIONS}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Conversion execution failed");
        }

        return { success: true, message: data.message };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

  /* ----------------------------------
     RETURN
  ---------------------------------- */
  return {
    result,
    isLoading,
    error,
    convertCoin,
    executeConversion,
  };
};

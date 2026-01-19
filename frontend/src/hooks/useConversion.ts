import { useState, useCallback } from "react";
import { useFetchData } from "./use-api";
import { COINS } from "./apiEndpoint";
import { CookieManager } from "@/utils/cookie-utils";

export interface ConversionResult {
  success: boolean;
  mode: "single" | "portfolio";
  from?: string;
  to?: string;
  amount?: number;
  conversionRate?: number;
  convertedAmount?: number;
  fromPrice?: number;
  toPrice?: number;
  base?: string;
  totalValue?: number;
  wallets?: Array<{
    walletId: string;
    coin: string;
    balance: number;
    price: number;
    conversionRate: number;
    convertedAmount: number;
    convertedTo: string;
  }>;
}

export const useConversion = () => {
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accessToken = CookieManager.get("tradovate-token");

  const convertCoin = useCallback(
    async (
      fromSymbol?: string,
      toSymbol: string = "USDT",
      amount?: number,
    ): Promise<ConversionResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (fromSymbol) params.append("coin", fromSymbol);
        params.append("to", toSymbol);
        if (amount) params.append("amount", amount.toString());

        const response = await fetch(
          `${import.meta.env.VITE_BASE_UR || "http://localhost:4001/api/v1"}${COINS.CONVERSIONS}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Conversion failed");
        }

        const data: ConversionResult = await response.json();
        setResult(data);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const executeConversion = useCallback(
    async (
      fromSymbol: string,
      toSymbol: string,
      amount: number,
    ): Promise<{ success: boolean; message?: string; error?: string }> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_UR || "http://localhost:4001/api/v1"}${COINS.CONVERSIONS}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ fromSymbol, toSymbol, amount }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Execution failed");
        }

        return { success: true, message: data.message };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    result,
    isLoading,
    error,
    convertCoin,
    executeConversion,
  };
};

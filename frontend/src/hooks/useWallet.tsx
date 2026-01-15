import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchData } from "./use-api";
import { COINS } from "./apiEndpoint";

export interface Wallet {
  id: string;
  userId: string;
  coinId: string;
  balance: number;
  locked_balance: number;
  address: string | null;
  coin: {
    id: string;
    name: string;
    symbol: string;
    iconUrl: string | null;
  };
  network?: {
    id: string;
    name: string;
    icon: string | null;
  };
}

export const useWallet = () => {
  const { data, ...rest } = useFetchData<{ success: boolean; assets: any[] }>(
    COINS.ASSETS,
    "assets"
  );

  return {
    data: data?.assets || [],
    ...rest,
  };
};

export const useInitializeWallets = () => {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Stubbed as the backend should handle wallet creation via /market/wallet
      // or we can implement a bulk init endpoint later if needed.
      console.log("useInitializeWallets called - stubbed");
      return true;
    },
  });
};

export const useUpdateWalletBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      availableBalance,
    }: {
      walletId: string;
      availableBalance: number;
    }) => {
      // Typically an admin task or handled by trade/deposit
      console.warn(
        "useUpdateWalletBalance is not fully implemented for frontend project."
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

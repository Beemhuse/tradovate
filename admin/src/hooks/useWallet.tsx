import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetchData } from "./use-api";

export interface Wallet {
  id: string;
  userId: string;
  coinId: string;
  balance: number;
  coin: {
    id: string;
    name: string;
    symbol: string;
    iconUrl: string | null;
  };
  network?: {
    id: string;
    name: string;
    icon?: string | null;
  } | null;
}

export const useWallet = () => {
  const { data, ...rest } = useFetchData<{ success: boolean; assets: any[] }>(
    "/market/assets",
    "assets"
  );
  return {
    data: data?.assets || [],
    ...rest,
  };
};

export const useInitializeWallets = () => {
  return useMutation({
    mutationFn: async () => {
      console.log("useInitializeWallets stubbed");
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
      console.warn(
        "useUpdateWalletBalance not implemented for admin project (use useAdminUpdateWallet instead)"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

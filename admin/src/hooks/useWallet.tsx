import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Wallet {
  id: string;
  user_id: string;
  coin_id: string;
  available_balance: number;
  locked_balance: number;
  pending_balance: number;
  on_hold_balance: number;
  created_at: string;
  updated_at: string;
  coins?: {
    id: string;
    name: string;
    symbol: string;
    icon_url: string | null;
  };
}

export const useWallet = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("wallets")
        .select(`
          *,
          coins (
            id,
            name,
            symbol,
            icon_url
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });
};

export const useInitializeWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");

      // Get all active coins
      const { data: coins, error: coinsError } = await supabase
        .from("coins")
        .select("id")
        .eq("is_active", true);

      if (coinsError) throw coinsError;

      // Check existing wallets
      const { data: existingWallets } = await supabase
        .from("wallets")
        .select("coin_id")
        .eq("user_id", user.id);

      const existingCoinIds = existingWallets?.map((w) => w.coin_id) || [];

      // Create wallets for coins that don't exist yet
      const newWallets = coins
        .filter((coin) => !existingCoinIds.includes(coin.id))
        .map((coin) => ({
          user_id: user.id,
          coin_id: coin.id,
          available_balance: 0,
          locked_balance: 0,
          pending_balance: 0,
          on_hold_balance: 0,
        }));

      if (newWallets.length > 0) {
        const { error } = await supabase.from("wallets").insert(newWallets);
        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
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
      const { error } = await supabase
        .from("wallets")
        .update({
          available_balance: availableBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

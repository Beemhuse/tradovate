import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  kyc_status: string;
  is_suspended: boolean;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<UserProfile, "is_suspended" | "is_banned" | "kyc_status">>;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useAdminWallets = (userId?: string) => {
  return useQuery({
    queryKey: ["admin-wallets", userId],
    queryFn: async () => {
      let query = supabase
        .from("wallets")
        .select(`
          *,
          coins (
            id,
            name,
            symbol,
            icon_url
          )
        `);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !userId || userId.length > 0,
  });
};

export const useAdminUpdateWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      walletId,
      updates,
      reason,
      adminId,
      targetUserId,
    }: {
      walletId: string;
      updates: {
        available_balance?: number;
        locked_balance?: number;
        pending_balance?: number;
        on_hold_balance?: number;
      };
      reason: string;
      adminId: string;
      targetUserId: string;
    }) => {
      // Update wallet
      const { error: walletError } = await supabase
        .from("wallets")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", walletId);

      if (walletError) throw walletError;

      // Log the action
      const { error: logError } = await supabase.from("admin_logs").insert({
        admin_id: adminId,
        action: "wallet_balance_update",
        target_user_id: targetUserId,
        details: { wallet_id: walletId, updates, reason },
      });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wallets"] });
    },
  });
};

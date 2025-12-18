import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  icon_url: string | null;
  deposit_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCoins = (includeInactive = false) => {
  return useQuery({
    queryKey: ["coins", includeInactive],
    queryFn: async () => {
      let query = supabase.from("coins").select("*").order("name");
      
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Coin[];
    },
  });
};

export const useCreateCoin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (coin: Omit<Coin, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("coins")
        .insert(coin)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coins"] });
    },
  });
};

export const useUpdateCoin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coin> & { id: string }) => {
      const { data, error } = await supabase
        .from("coins")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coins"] });
    },
  });
};

export const useDeleteCoin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coins"] });
    },
  });
};

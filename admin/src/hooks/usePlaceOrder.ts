import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TradePayload } from "@/types/trade";

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (payload: TradePayload) => {
      const { data } = await api.post("/orders", payload);
      return data;
    },
  });
};

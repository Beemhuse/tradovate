import { useFetchData } from "./use-api";
import { COINS } from "./apiEndpoint";

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useCoins = () => {
  const { data, ...rest } = useFetchData<{ success: boolean; coins: Coin[] }>(
    COINS.COINLIST,
    "coins"
  );
  return {
    data: data?.coins || [],
    ...rest,
  };
};

export const useCreateCoin = () => {
  // This should be in admin project, but if needed here:
  console.warn(
    "useCreateCoin is not fully implemented for frontend project as it's an admin task."
  );
  return { mutate: () => {}, isPending: false };
};

export const useUpdateCoin = () => {
  console.warn(
    "useUpdateCoin is not fully implemented for frontend project as it's an admin task."
  );
  return { mutate: () => {}, isPending: false };
};

export const useDeleteCoin = () => {
  console.warn(
    "useDeleteCoin is not fully implemented for frontend project as it's an admin task."
  );
  return { mutate: () => {}, isPending: false };
};

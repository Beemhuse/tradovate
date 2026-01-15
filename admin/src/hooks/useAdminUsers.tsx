import { useFetchData, usePatchData, useCreateData } from "./use-api";

export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  kycStatus: string;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useAdminUsers = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    users: UserProfile[];
  }>("/admin/users", "admin-users");
  return {
    data: data?.users || [],
    ...rest,
  };
};

export const useUpdateUserStatus = () => {
  return usePatchData<any, { suspend: boolean; reason?: string }>(
    (id: string) => `/admin/users/${id}/suspend`,
    ["admin-users"]
  );
};

export const useAdminWallets = (userId?: string) => {
  // Backend returns wallets with user if using /admin/users/:id or /admin/users
  // But if we want specific wallets for a user:
  const endpoint = userId ? `/admin/users/${userId}` : `/admin/users`;
  const { data, ...rest } = useFetchData<any>(endpoint, "admin-wallets");
  return {
    data:
      data?.user?.wallets || data?.users?.flatMap((u: any) => u.wallets) || [],
    ...rest,
  };
};

export const useAdminUpdateWallet = () => {
  return useCreateData<any, { walletId: string; balance: number }>(
    "/admin/wallet/update",
    ["admin-wallets", "admin-users"]
  );
};

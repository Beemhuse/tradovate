import { useFetchData, useUpdateData, usePatchData } from "./use-api";

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
  // Backend has /admin/users/:id/suspend
  return usePatchData<any, { suspend: boolean; reason?: string }>(
    (id: string) => `/admin/users/${id}/suspend`,
    ["admin-users"]
  );
};

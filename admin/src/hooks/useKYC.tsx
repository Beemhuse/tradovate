import { useFetchData, useCreateData, usePatchData } from "./use-api";

export interface KYCDocument {
  id: string;
  userId: string;
  status: string;
  frontImage: string;
  backImage: string;
  reason: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    fullName: string | null;
    email: string | null;
  };
}

export const useUserKYC = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    kyc: KYCDocument;
  }>("/api/v1/kyc/me", "kyc-me");
  return {
    data: data?.kyc ? [data.kyc] : [],
    ...rest,
  };
};

export const useAllKYC = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    kycs: KYCDocument[];
  }>("/api/v1/kyc/admin/list", "all-kyc");
  return {
    data: data?.kycs || [],
    ...rest,
  };
};

export const useSubmitKYC = () => {
  return useCreateData<any, FormData>("/api/v1/kyc", ["kyc-me"], true);
};

export const useUpdateKYCStatus = () => {
  return usePatchData<any, { status: string; reason?: string }>(
    (id: string) => `/api/v1/kyc/admin/${id}/status`,
    ["all-kyc"]
  );
};

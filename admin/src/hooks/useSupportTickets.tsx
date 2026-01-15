import { useFetchData, useCreateData, usePatchData } from "./use-api";

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  adminId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    fullName: string | null;
    email: string | null;
  };
}

export const useUserTickets = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    tickets: SupportTicket[];
  }>("/api/v1/support", "tickets");
  return {
    data: data?.tickets || [],
    ...rest,
  };
};

export const useAllTickets = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    tickets: SupportTicket[];
  }>("/api/v1/support/all", "all-tickets");
  return {
    data: data?.tickets || [],
    ...rest,
  };
};

export const useCreateTicket = () => {
  return useCreateData<any, { subject: string; message: string }>(
    "/api/v1/support",
    ["tickets"]
  );
};

export const useReplyTicket = () => {
  return usePatchData<any, { id: string; adminReply: string; status: string }>(
    (data: { id: string }) => `/api/v1/support/${data.id}/reply`,
    ["all-tickets", "tickets"]
  );
};

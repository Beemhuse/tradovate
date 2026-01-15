import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useFetchData,
  useCreateData,
  useUpdateData,
  usePatchData,
} from "./use-api";
import { SUPPORT } from "./apiEndpoint";

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
  }>(SUPPORT.TICKETS, "tickets");
  return {
    data: data?.tickets || [],
    ...rest,
  };
};

export const useAllTickets = () => {
  const { data, ...rest } = useFetchData<{
    success: boolean;
    tickets: SupportTicket[];
  }>(SUPPORT.ALL_TICKETS, "all-tickets");
  return {
    data: data?.tickets || [],
    ...rest,
  };
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  const createTicketMutation = useCreateData<
    any,
    { subject: string; message: string }
  >(SUPPORT.TICKETS, ["tickets"]);

  return {
    mutate: (vars: { subject: string; message: string }) =>
      createTicketMutation.mutate(vars),
    ...createTicketMutation,
  };
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      adminReply,
      status,
    }: {
      id: string;
      adminReply: string;
      status: "open" | "closed";
    }) => {
      // We use a custom fetch or patch from use-api pattern
      // But use-api usePatchData takes endpoint and queryKey
      // Let's use it properly
      // SUPPORT.REPLY is a function, usePatchData handles function endpoints?
      // In use-api.ts: export const usePatchData = <T = any, D = any>(endpoint: Endpoint, queryKey: QueryKey) => { ... }
      // Endpoint = string | ((id: string | number) => string);
      // So yes.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    },
  });
};

// Re-implementing useReplyTicket using usePatchData
export const useReplyTicketApi = () => {
  return usePatchData<any, { adminReply: string; status: string }>(
    SUPPORT.REPLY as any, // It's (id) => url
    ["all-tickets"]
  );
};

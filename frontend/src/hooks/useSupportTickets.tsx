import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  admin_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useUserTickets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    },
    enabled: !!user,
  });
};

export const useAllTickets = () => {
  return useQuery({
    queryKey: ["all-tickets"],
    queryFn: async () => {
      // First get all tickets
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (ticketError) throw ticketError;

      // Get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");
      if (profilesError) throw profilesError;

      // Join manually
      return ticketData.map((ticket) => ({
        ...ticket,
        profiles: profiles.find((p) => p.user_id === ticket.user_id) || null,
      })) as SupportTicket[];
    },
  });
};

export const useCreateTicket = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      if (!user) throw new Error("No user");

      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        subject,
        message,
        status: "open",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useReplyTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      adminReply,
      adminId,
      status,
    }: {
      id: string;
      adminReply: string;
      adminId: string;
      status: "open" | "closed";
    }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          admin_reply: adminReply,
          admin_id: adminId,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tickets"] });
    },
  });
};

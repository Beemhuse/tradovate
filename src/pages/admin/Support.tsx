import { useState } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { useAllTickets, useReplyTicket } from "@/hooks/useSupportTickets";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  const { data: tickets, isLoading } = useAllTickets();
  const replyTicket = useReplyTicket();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReply = async (closeTicket: boolean) => {
    if (!selectedTicket || !reply.trim()) {
      toast({ title: "Please enter a reply", variant: "destructive" });
      return;
    }

    try {
      await replyTicket.mutateAsync({
        id: selectedTicket.id,
        adminReply: reply.trim(),
        adminId: user?.id || "",
        status: closeTicket ? "closed" : "open",
      });

      // Send email notification
      const userEmail = selectedTicket.profiles?.email;
      if (userEmail) {
        await supabase.functions.invoke("send-notification", {
          body: {
            to: userEmail,
            type: "support_reply",
            data: { subject: selectedTicket.subject },
          },
        });
      }

      toast({ title: closeTicket ? "Ticket closed with reply" : "Reply sent" });
      setSelectedTicket(null);
      setReply("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "closed" ? (
      <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Closed</Badge>
    ) : (
      <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Open</Badge>
    );
  };

  const openTickets = tickets?.filter((t) => t.status === "open") || [];
  const closedTickets = tickets?.filter((t) => t.status === "closed") || [];

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and respond to user support requests</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{openTickets.length}</div>
              <p className="text-muted-foreground">Open Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{closedTickets.length}</div>
              <p className="text-muted-foreground">Closed Tickets</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          {getStatusBadge(ticket.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From: {ticket.profiles?.full_name || ticket.profiles?.email || "Unknown"}
                        </p>
                        <p className="text-sm">{ticket.message.substring(0, 100)}...</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setReply(ticket.admin_reply || "");
                        }}
                      >
                        {ticket.status === "open" ? "Reply" : "View"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No support tickets</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded p-4">
              <p className="text-sm font-medium mb-1">
                From: {selectedTicket?.profiles?.full_name || selectedTicket?.profiles?.email}
              </p>
              <p className="text-sm">{selectedTicket?.message}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Your Reply:</p>
              <Textarea
                placeholder="Type your response..."
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={selectedTicket?.status === "closed"}
              />
            </div>

            {selectedTicket?.status === "open" && (
              <div className="flex gap-2">
                <Button onClick={() => handleReply(false)} disabled={replyTicket.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReply(true)}
                  disabled={replyTicket.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reply & Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;

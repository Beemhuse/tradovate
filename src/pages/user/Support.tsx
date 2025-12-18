import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTickets, useCreateTicket } from "@/hooks/useSupportTickets";
import { useToast } from "@/hooks/use-toast";

const UserSupport = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { user, isLoading: authLoading } = useAuth();
  const { data: tickets, isLoading } = useUserTickets();
  const createTicket = useCreateTicket();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      await createTicket.mutateAsync({ subject: subject.trim(), message: message.trim() });
      toast({ title: "Support ticket created successfully" });
      setSubject("");
      setMessage("");
    } catch (error: any) {
      toast({ title: "Error creating ticket", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "closed" ? (
      <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Closed</Badge>
    ) : (
      <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Open</Badge>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNav />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* New Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Ticket</CardTitle>
              <CardDescription>Describe your issue and we'll get back to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Provide details about your issue..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createTicket.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
              </Button>
            </CardContent>
          </Card>

          {/* Ticket History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tickets</CardTitle>
              <CardDescription>View your support ticket history</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{ticket.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>

                      <div className="bg-secondary/50 rounded p-3">
                        <p className="text-sm font-medium mb-1">Your message:</p>
                        <p className="text-sm text-muted-foreground">{ticket.message}</p>
                      </div>

                      {ticket.admin_reply && (
                        <div className="bg-primary/10 rounded p-3">
                          <p className="text-sm font-medium mb-1">Support reply:</p>
                          <p className="text-sm">{ticket.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tickets submitted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSupport;

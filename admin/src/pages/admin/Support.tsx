import { useState, useEffect } from "react";
import AdminNav from "@/components/layout/AdminNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  Settings,
  Save,
} from "lucide-react";
import { useAllTickets, useReplyTicket } from "@/hooks/useSupportTickets";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useFetchData, useCreateData } from "@/hooks/use-api";

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState("");

  // Contact Info State
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  const { data: tickets, isLoading } = useAllTickets();
  const replyTicket = useReplyTicket();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch Contact Info
  const { data: contactData, isLoading: loadingContact } = useFetchData(
    "/contact",
    "contact-info"
  );

  // Update Contact Info Mutation
  const { mutate: updateContact, isPending: updatingContact } = useCreateData(
    "/contact",
    ["contact-info"]
  );

  // Load initial data
  useEffect(() => {
    if (contactData) {
      setContactEmail(contactData.email || "");
      setContactPhone(contactData.phone || "");
      setContactWhatsapp(contactData.whatsapp || "");
      setContactAddress(contactData.address || "");
    }
  }, [contactData]);

  const handleUpdateContact = () => {
    updateContact(
      {
        email: contactEmail,
        phone: contactPhone,
        whatsapp: contactWhatsapp,
        address: contactAddress,
      },
      {
        onSuccess: () => {
          toast({ title: "Contact info updated successfully" });
        },
      }
    );
  };

  const handleReply = async (closeTicket: boolean) => {
    if (!selectedTicket || !reply.trim()) {
      toast({ title: "Please enter a reply", variant: "destructive" });
      return;
    }

    try {
      await replyTicket.mutateAsync({
        id: selectedTicket.id,
        adminReply: reply.trim(),
        status: closeTicket ? "closed" : "open",
      });

      toast({ title: "Reply sent successfully" });
      setReply("");
      setSelectedTicket(null);
    } catch (error) {
      toast({ title: "Failed to send reply", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "closed" ? (
      <Badge className="bg-success">
        <CheckCircle className="h-3 w-3 mr-1" />
        Closed
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Open
      </Badge>
    );
  };

  const openTickets = tickets?.filter((t: any) => t.status === "open") || [];
  const closedTickets =
    tickets?.filter((t: any) => t.status === "closed") || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support & Settings</h1>
          <p className="text-muted-foreground">
            Manage support tickets and platform contact information
          </p>
        </div>

        {/* Contact Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Update the contact details displayed to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Input
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="123 Street, City"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUpdateContact} disabled={updatingContact}>
                {updatingContact ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                {tickets.map((ticket: any) => (
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
                          From:{" "}
                          {ticket.profiles?.full_name ||
                            ticket.profiles?.email ||
                            "Unknown"}
                        </p>
                        <p className="text-sm">
                          {ticket.message.substring(0, 100)}...
                        </p>
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
      <Dialog
        open={!!selectedTicket}
        onOpenChange={() => setSelectedTicket(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded p-4">
              <p className="text-sm font-medium mb-1">
                From:{" "}
                {selectedTicket?.profiles?.full_name ||
                  selectedTicket?.profiles?.email}
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
                <Button
                  onClick={() => handleReply(false)}
                  disabled={replyTicket.isPending}
                >
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

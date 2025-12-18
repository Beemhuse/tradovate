import { useState } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, FileCheck, Clock } from "lucide-react";
import { useAllKYC, useUpdateKYCStatus } from "@/hooks/useKYC";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminKYC = () => {
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: kycDocs, isLoading } = useAllKYC();
  const updateStatus = useUpdateKYCStatus();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleApprove = async (doc: any) => {
    try {
      await updateStatus.mutateAsync({
        id: doc.id,
        status: "approved",
        reviewedBy: user?.id || "",
      });

      // Send email notification
      const userEmail = doc.profiles?.email;
      if (userEmail) {
        await supabase.functions.invoke("send-notification", {
          body: { to: userEmail, type: "kyc_approved" },
        });
      }

      // Update user's KYC status in profile
      await supabase
        .from("profiles")
        .update({ kyc_status: "approved" })
        .eq("user_id", doc.user_id);

      toast({ title: "KYC approved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;

    try {
      await updateStatus.mutateAsync({
        id: selectedDoc.id,
        status: "rejected",
        rejectionReason,
        reviewedBy: user?.id || "",
      });

      // Send email notification
      const userEmail = selectedDoc.profiles?.email;
      if (userEmail) {
        await supabase.functions.invoke("send-notification", {
          body: { to: userEmail, type: "kyc_rejected", data: { reason: rejectionReason } },
        });
      }

      toast({ title: "KYC rejected" });
      setShowRejectDialog(false);
      setSelectedDoc(null);
      setRejectionReason("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const pendingDocs = kycDocs?.filter((d) => d.status === "pending") || [];

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Management</h1>
          <p className="text-muted-foreground">Review and approve user identity verification</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{pendingDocs.length}</div>
              <p className="text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {kycDocs?.filter((d) => d.status === "approved").length || 0}
              </div>
              <p className="text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {kycDocs?.filter((d) => d.status === "rejected").length || 0}
              </div>
              <p className="text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KYC Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : kycDocs && kycDocs.length > 0 ? (
              <div className="space-y-4">
                {kycDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">
                            {doc.profiles?.full_name || doc.profiles?.email || "Unknown User"}
                          </h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{doc.profiles?.email}</p>
                        <p className="text-sm capitalize">
                          Document: {doc.document_type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(doc.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.document_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success border-success hover:bg-success/10"
                              onClick={() => handleApprove(doc)}
                              disabled={updateStatus.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedDoc(doc);
                                setShowRejectDialog(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No KYC submissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Input
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={updateStatus.isPending}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYC;

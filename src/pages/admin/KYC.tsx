// pages/AdminKYC.tsx
import { useState, useMemo } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, FileCheck, Clock } from "lucide-react";
import { useFetchData, usePatchData } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

/**
 * AdminKYC page — fetches KYC submissions, shows list, opens details modal,
 * and allows approve/reject (with a reason) via API.
 *
 * Backend endpoints expected:
 * GET  /admin/kyc               -> { success: true, count, kyc: KycRecord[] }
 * PATCH /admin/kyc/:id/status  -> { success: true, frontendMessage, kyc }
 */

type KycRecord = {
  id: string;
  userId?: string;
  status: "pending" | "approved" | "rejected" | string;
  frontImage: string | null;
  backImage: string | null;
  reason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  // user/profile payload from server
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
  } | null;
  // raw passthrough
  [k: string]: any;
};

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return <Badge className="bg-success text-success-foreground">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

export default function AdminKYC() {
  const { toast } = useToast();
  const { data, isLoading } = useFetchData<{ success: boolean; count: number; kyc: KycRecord[] }>(
    "/kyc/admin/list",
    "admin-kyc"
  );

const kycDocs: KycRecord[] = useMemo(() => {
  return data?.kyc ?? [];
}, [data]);

  // modal / selected doc
  const [selectedDoc, setSelectedDoc] = useState<KycRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // reject dialog state
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // patch hook to update status; supports dynamic endpoint function
  const updateKyc = usePatchData<
    any,
    { id: string; status: "approved" | "rejected"; reason?: string | null }
  >((payload) => `/kyc/admin/${payload.id}/status`, ["admin-kyc"]);

  // derived counts
  const stats = useMemo(
    () => ({
      pending: kycDocs.filter((d) => d.status?.toLowerCase() === "pending").length,
      approved: kycDocs.filter((d) => d.status?.toLowerCase() === "approved").length,
      rejected: kycDocs.filter((d) => d.status?.toLowerCase() === "rejected").length,
    }),
    [kycDocs]
  );

  // Open details modal
  const openDetails = (doc: KycRecord) => {
    setSelectedDoc(doc);
    setShowDetails(true);
  };

  // Approve
  const handleApprove = async (doc: KycRecord) => {
    try {
      await updateKyc.mutateAsync({ id: doc.id, status: "approved" });
      toast({ title: "KYC approved", description: "User KYC has been approved." });
      setShowDetails(false);
      setSelectedDoc(null);
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to approve", variant: "destructive" });
    }
  };

  // Start reject flow: open reject dialog for selected doc
  const startReject = (doc: KycRecord) => {
    setSelectedDoc(doc);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  // Confirm reject
  const handleReject = async () => {
    if (!selectedDoc) return;
    try {
      await updateKyc.mutateAsync({ id: selectedDoc.id, status: "rejected", reason: rejectionReason || undefined });
      toast({ title: "KYC rejected", description: "User KYC has been rejected." });
      setShowRejectDialog(false);
      setShowDetails(false);
      setSelectedDoc(null);
      setRejectionReason("");
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to reject", variant: "destructive" });
    }
  };

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
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <p className="text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
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
                  <div key={doc.id} className="border border-border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">
                            {doc.user?.name || doc.user?.email || "Unknown User"}
                          </h3>
                          <div>{getStatusBadge(String(doc.status || "pending"))}</div>
                        </div>

                        <p className="text-sm text-muted-foreground">{doc.user?.email}</p>
                        <p className="text-sm capitalize">Document: {doc.frontImage ? "ID (front/back)" : "Document"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(doc.createdAt || doc.created_at || Date.now()).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetails(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>

                        {String(doc.status).toLowerCase() === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success border-success hover:bg-success/10"
                              onClick={() => handleApprove(doc)}
                              disabled={updateKyc.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              onClick={() => startReject(doc)}
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

      {/* Details modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>KYC Details</DialogTitle>
          </DialogHeader>

          {selectedDoc ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <div className="font-medium">{selectedDoc.user?.name || "-"}</div>

                  <Label className="mt-2">Email</Label>
                  <div className="text-sm text-muted-foreground">{selectedDoc.user?.email || "-"}</div>

                  <Label className="mt-2">Status</Label>
                  <div>{getStatusBadge(String(selectedDoc.status))}</div>

                  <Label className="mt-2">Submitted at</Label>
                  <div className="text-sm text-muted-foreground">{new Date(selectedDoc.createdAt || selectedDoc.created_at || Date.now()).toLocaleString()}</div>

                  {selectedDoc.reviewedBy && (
                    <>
                      <Label className="mt-2">Reviewed by</Label>
                      <div className="text-sm text-muted-foreground">{selectedDoc.reviewedBy}</div>
                    </>
                  )}

                  {selectedDoc.adminMessage && (
                    <>
                      <Label className="mt-2">Admin message</Label>
                      <div className="text-sm text-muted-foreground">{selectedDoc.adminMessage}</div>
                    </>
                  )}
                </div>

                <div>
                  <Label>Front image</Label>
                  {selectedDoc.frontImage ? (
                    <div className="border rounded overflow-hidden mt-2">
                      <img src={selectedDoc.frontImage} alt="KYC front" className="w-full object-contain" />
                      <div className="p-2 flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => window.open(selectedDoc.frontImage, "_blank")}>Open</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2">Not provided</div>
                  )}

                  <Label className="mt-4">Back image</Label>
                  {selectedDoc.backImage ? (
                    <div className="border rounded overflow-hidden mt-2">
                      <img src={selectedDoc.backImage} alt="KYC back" className="w-full object-contain" />
                      <div className="p-2 flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => window.open(selectedDoc.backImage, "_blank")}>Open</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2">Not provided</div>
                  )}
                </div>
              </div>

              {/* action row inside modal */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {String(selectedDoc.status).toLowerCase() === "pending" && (
                  <>
                    <Button variant="outline" onClick={() => startReject(selectedDoc)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>

                    <Button
                      className="text-success"
                      onClick={() => handleApprove(selectedDoc)}
                      disabled={updateKyc.isPending}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}

                <Button variant="ghost" onClick={() => { setShowDetails(false); setSelectedDoc(null); }}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div>No details</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Reason for rejection</Label>
              <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this was rejected" />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={updateKyc.isPending}>
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

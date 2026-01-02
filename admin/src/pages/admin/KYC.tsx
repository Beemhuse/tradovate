import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useFetchData, usePatchData } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import KycDetailsDialog from "@/components/admin/kyc/KycDetailsDialog";

type KycRecord = {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  frontImage?: string | null;
  backImage?: string | null;
  reason?: string | null;
  createdAt: string;
  user?: {
    email?: string;
  };
};

export default function AdminKYC() {
  const { toast } = useToast();

  const { data, isLoading } = useFetchData<{
    success: boolean;
    kyc: KycRecord[];
  }>("/kyc/admin/list", "admin-kyc");

  const records = data?.kyc ?? [];

  const [selected, setSelected] = useState<KycRecord | null>(null);
  const [open, setOpen] = useState(false);

  const updateKyc = usePatchData<
    any,
    { id: string; status: "approved" | "rejected"; reason?: string }
  >((p) => `/kyc/admin/${p.id}/status`, ["admin-kyc"]);

  const openDetails = (r: KycRecord) => {
    setSelected(r);
    setOpen(true);
  };

  const approve = async () => {
    if (!selected) return;
    await updateKyc.mutateAsync({
      id: selected.id,
      status: "approved",
    });
    toast({ title: "KYC approved" });
    setOpen(false);
  };

  const reject = async () => {
    if (!selected) return;
    await updateKyc.mutateAsync({
      id: selected.id,
      status: "rejected",
    });
    toast({ title: "KYC rejected", variant: "destructive" });
    setOpen(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">KYC Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading…</p>
          ) : records.length === 0 ? (
            <p className="text-muted-foreground">No submissions</p>
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center border rounded p-4"
                >
                  <div>
                    <p className="font-medium">{r.user?.email}</p>
                    <Badge>{r.status}</Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openDetails(r)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <KycDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        kyc={selected}
        onApprove={approve}
        onReject={reject}
        isPending={updateKyc.isPending}
      />
    </div>
  );
}

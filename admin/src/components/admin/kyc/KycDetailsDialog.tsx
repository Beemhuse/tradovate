import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useKycImage } from "@/hooks/useKycImage";

type Props = {
  open: boolean;
  onClose: () => void;
  kyc: any | null;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
};

export default function KycDetailsDialog({
  open,
  onClose,
  kyc,
  onApprove,
  onReject,
  isPending,
}: Props) {
  const front = useKycImage(kyc?.userId, kyc?.frontImage);
  const back = useKycImage(kyc?.userId, kyc?.backImage);

  if (!kyc) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>KYC Details</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-1 gap-6">
          {/* LEFT — METADATA */}
          <div className="space-y-2 grid grid-cols-3">
            <div className="space-y-6">
              <Label>Email</Label>
              <div>{kyc.user?.email}</div>
            </div>
            <div className="flex flex-col w-fit space-y-6">
              <Label>Status</Label>
              <Badge>{kyc.status}</Badge>
            </div>
            <div className="space-y-6">
              <Label>Submitted</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(kyc.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* RIGHT — IMAGES */}
          <div className="space-y-4 grid grid-cols-2 gap-4">
            <div>
              <Label>Front</Label>
              {front.isLoading && <p>Loading front…</p>}
              {front.isError && <p>Failed to load front image</p>}
              {front.data && (
                <img
                  src={front.data}
                  alt="KYC front"
                  className="w-full object-contain"
                />
              )}
            </div>

            <div>
              <Label>Back</Label>
              {back?.data ? (
                <img
                  src={back.data}
                  className="border rounded w-full object-contain"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Loading…</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {kyc.status === "PENDING" && (
            <>
              <Button variant="outline" onClick={onReject} disabled={isPending}>
                Reject
              </Button>
              <Button onClick={onApprove} disabled={isPending}>
                Approve
              </Button>
            </>
          )}
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

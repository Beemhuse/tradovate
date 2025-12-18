// components/coin-management/EditCoinDialog.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditCoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin: {
    id: string;
    name: string;
    symbol: string;
    icon: string;
    isActive: boolean;
  };
  onSave: (coinData: {
    id: string;
    name: string;
    symbol: string;
    icon: string;
    isActive: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

const EditCoinDialog = ({
  open,
  onOpenChange,
  coin,
  onSave,
  isLoading = false,
}: EditCoinDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Coin</DialogTitle>
          <DialogDescription>Modify coin details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-coin-name">Coin Name</Label>
            <Input
              id="edit-coin-name"
              value={coin.name}
              onChange={(e) =>
                onSave({ ...coin, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-coin-symbol">Symbol</Label>
            <Input
              id="edit-coin-symbol"
              value={coin.symbol}
              onChange={(e) =>
                onSave({ ...coin, symbol: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-coin-icon">Icon URL</Label>
            <Input
              id="edit-coin-icon"
              value={coin.icon}
              onChange={(e) =>
                onSave({ ...coin, icon: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Label>Active</Label>
            <input
              type="checkbox"
              checked={coin.isActive}
              onChange={(e) =>
                onSave({ ...coin, isActive: e.target.checked })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(coin)} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCoinDialog;
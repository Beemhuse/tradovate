// components/coin-management/EditCoinDialog.tsx
import { useEffect, useState } from "react";
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
  const [form, setForm] = useState(coin);

  // Sync form when dialog opens or coin changes
  useEffect(() => {
    if (open) {
      setForm(coin);
    }
  }, [open, coin]);

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave(form);
  };

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
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-coin-symbol">Symbol</Label>
            <Input
              id="edit-coin-symbol"
              value={form.symbol}
              onChange={(e) => handleChange("symbol", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-coin-icon">Icon URL</Label>
            <Input
              id="edit-coin-icon"
              value={form.icon}
              onChange={(e) => handleChange("icon", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="edit-coin-active">Active</Label>
            <input
              id="edit-coin-active"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                handleChange("isActive", e.target.checked)
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCoinDialog;

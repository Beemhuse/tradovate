// components/coin-management/AddCoinDialog.tsx
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface AddCoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCoin: (coinData: {
    name: string;
    symbol: string;
    icon: string;
    wallet: string;
    networkName: string;
    networkType: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

const AddCoinDialog = ({
  open,
  onOpenChange,
  onAddCoin,
  isLoading = false,
}: AddCoinDialogProps) => {
  const [newCoin, setNewCoin] = useState({
    name: "",
    symbol: "",
    icon: "",
    wallet: "",
    networkName: "",
    networkType: "",
  });

  const handleSubmit = async () => {
    if (!newCoin.name || !newCoin.symbol) return;
    await onAddCoin(newCoin);
    setNewCoin({
      name: "",
      symbol: "",
      icon: "",
      wallet: "",
      networkName: "",
      networkType: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Coin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Coin</DialogTitle>
          <DialogDescription>
            Enter the details of the new cryptocurrency
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="coin-name">Coin Name</Label>
            <Input
              id="coin-name"
              placeholder="Bitcoin"
              value={newCoin.name}
              onChange={(e) =>
                setNewCoin({ ...newCoin, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coin-symbol">Symbol</Label>
            <Input
              id="coin-symbol"
              placeholder="BTC"
              value={newCoin.symbol}
              onChange={(e) =>
                setNewCoin({ ...newCoin, symbol: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coin-icon">Icon (emoji or character)</Label>
            <Input
              id="coin-icon"
              placeholder="₿"
              value={newCoin.icon}
              onChange={(e) =>
                setNewCoin({ ...newCoin, icon: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coin-wallet">Deposit Wallet Address</Label>
            <Input
              id="coin-wallet"
              placeholder="0x..."
              value={newCoin.wallet}
              onChange={(e) =>
                setNewCoin({ ...newCoin, wallet: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="network-name">Network Name</Label>
            <Input
              id="network-name"
              placeholder="Ethereum Mainnet"
              value={newCoin.networkName}
              onChange={(e) =>
                setNewCoin({ ...newCoin, networkName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="network-type">Network Type (optional)</Label>
            <Input
              id="network-type"
              placeholder="ERC20"
              value={newCoin.networkType}
              onChange={(e) =>
                setNewCoin({ ...newCoin, networkType: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Coin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoinDialog;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Copy,
  ExternalLink,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  User,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "./types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDetailsDialog = ({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsDialogProps) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      duration: 2000,
    });
  };

  const handleDownloadReceipt = () => {
    // Implement receipt download
    toast({
      title: "Downloading receipt...",
      description: "Your transaction receipt is being prepared.",
    });
  };

  const handleViewOnExplorer = () => {
    if (transaction.txHash && transaction.wallet?.network.explorerUrl) {
      const explorerUrl = `${transaction.wallet.network.explorerUrl}/tx/${transaction.txHash}`;
      window.open(explorerUrl, "_blank");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const isPositive = (type: string) => {
    return ["DEPOSIT", "TRADE_WIN", "TRADE_PROFIT", "BONUS"].includes(type);
  };

  const isNegative = (type: string) => {
    return ["WITHDRAWAL", "TRADE_OPEN", "FEE"].includes(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Transaction Details</span>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  isPositive(transaction.type)
                    ? "bg-green-500/10 text-green-700 border-green-500/30"
                    : isNegative(transaction.type)
                    ? "bg-red-500/10 text-red-700 border-red-500/30"
                    : "bg-purple-500/10 text-purple-700 border-purple-500/30"
                )}
              >
                {transaction.type}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  transaction.status === "COMPLETED"
                    ? "bg-green-500/20 text-green-700"
                    : transaction.status === "FAILED"
                    ? "bg-red-500/20 text-red-700"
                    : transaction.status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-700"
                    : "bg-gray-500/20 text-gray-700"
                )}
              >
                {getStatusIcon(transaction.status)}
                {transaction.status}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isPositive(transaction.type)
                  ? "text-green-600"
                  : isNegative(transaction.type)
                  ? "text-red-600"
                  : "text-gray-600"
              )}
            >
              {isPositive(transaction.type)
                ? "+"
                : isNegative(transaction.type)
                ? "-"
                : ""}
              ${transaction.amount.toFixed(2)}
            </div>
            {transaction.coin && (
              <div className="text-sm text-muted-foreground">
                Equivalent to {transaction.coin.symbol}
              </div>
            )}
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Timeline</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(transaction.createdAt),
                    "MMM dd, yyyy HH:mm:ss"
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Last Updated</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(transaction.updatedAt),
                    "MMM dd, yyyy HH:mm:ss"
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Transaction Details</div>
            <div className="space-y-3">
              {transaction.txHash && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Transaction Hash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">
                      {transaction.txHash.slice(0, 16)}...
                    </code>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                          handleCopy(transaction.txHash!, "Transaction hash")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleViewOnExplorer}
                        disabled={!transaction.wallet?.network.explorerUrl}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {transaction.toAddress && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">To Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">
                      {transaction.toAddress.slice(0, 12)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        handleCopy(transaction.toAddress!, "Address")
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {transaction.wallet && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">From Wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono">
                      {transaction.wallet.address.slice(0, 12)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        handleCopy(
                          transaction.wallet!.address,
                          "Wallet address"
                        )
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {transaction.network && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Network</span>
                  </div>
                  <div className="text-sm font-medium">
                    {transaction.network.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details (for withdrawals) */}
          {transaction.bankName && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="text-sm font-medium">Bank Details</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Bank Name
                    </div>
                    <div className="font-medium">{transaction.bankName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Account Name
                    </div>
                    <div className="font-medium">{transaction.accountName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Account Number
                    </div>
                    <div className="font-medium">
                      {transaction.accountNumber}
                    </div>
                  </div>
                  {transaction.ifscCode && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        IFSC Code
                      </div>
                      <div className="font-medium">{transaction.ifscCode}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Admin Actions */}
          {transaction.adminAction !== "NONE" && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium">Admin Action</div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      transaction.adminAction === "APPROVED"
                        ? "default"
                        : "destructive"
                    }
                    className={cn(
                      transaction.adminAction === "APPROVED"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    )}
                  >
                    {transaction.adminAction}
                  </Badge>
                  {transaction.adminMessage && (
                    <div className="text-sm text-muted-foreground">
                      {transaction.adminMessage}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsDialog;

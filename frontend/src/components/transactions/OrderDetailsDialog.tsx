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
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Percent, 
  Calendar,
  ExternalLink,
  Copy,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "./types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog = ({ order, open, onOpenChange }: OrderDetailsDialogProps) => {
  const { toast } = useToast();

  if (!order) return null;

  const handleCopy = (text: string, label: string) => {
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
      description: "Your order receipt is being prepared.",
    });
  };

  const pnl = order.pnl || 0;
  const pnlPercentage = order.entryPrice ? (pnl / order.entryPrice) * 100 : 0;
  const timeLeft = order.status === 'RUNNING' 
    ? Math.max(0, new Date(order.expiresAt).getTime() - new Date().getTime())
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <Badge
              variant={order.status === 'SETTLED' ? "default" : "secondary"}
              className={cn(
                order.status === 'SETTLED' ? "bg-green-100 text-green-800" :
                order.status === 'RUNNING' ? "bg-blue-100 text-blue-800" :
                order.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              )}
            >
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Order ID: {order.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Coin</div>
              <div className="flex items-center gap-2">
                {order.coin.iconUrl && (
                  <img 
                    src={order.coin.iconUrl} 
                    alt={order.coin.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div>
                  <div className="font-semibold">{order.coin.symbol}</div>
                  <div className="text-sm text-muted-foreground">{order.coin.name}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Pair</div>
              <div className="font-semibold">
                {order.pair?.symbol || "Spot"}
              </div>
              {order.pair && (
                <div className="text-sm text-muted-foreground">
                  {order.pair.baseCoin.name}/{order.pair.quoteCoin.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Direction</div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1",
                    order.direction === 'UP' 
                      ? "bg-green-500/10 text-green-700 border-green-500/30"
                      : "bg-red-500/10 text-red-700 border-red-500/30"
                  )}
                >
                  {order.direction === 'UP' 
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />
                  }
                  {order.direction}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Period</div>
              <div className="font-semibold">
                {order.period}
              </div>
              <div className="text-sm text-muted-foreground">
                {order.period === 'M1' ? '1 Minute' :
                 order.period === 'M5' ? '5 Minutes' :
                 order.period === 'M15' ? '15 Minutes' :
                 order.period === 'H1' ? '1 Hour' :
                 order.period === 'H4' ? '4 Hours' : '1 Day'}
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Stake Amount</div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold">${order.stake.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Entry Price</div>
              <div className="font-semibold">
                ${order.entryPrice.toFixed(order.coin.symbol === 'BTC' ? 2 : 4)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Profit Rate</div>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">
                  {(order.profitRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Potential Payout</div>
              <div className="font-semibold">
                ${(order.stake * (1 + order.profitRate)).toFixed(2)}
              </div>
            </div>
          </div>

          {order.status === 'SETTLED' && order.result && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Result</div>
                <div className={cn(
                  "font-bold text-lg",
                  order.result === 'WON' ? "text-green-600" : 
                  order.result === 'LOST' ? "text-red-600" : 
                  "text-gray-600"
                )}>
                  {order.result === 'WON' ? '🎉 YOU WON!' : 
                   order.result === 'LOST' ? '😞 You Lost' : 
                   '🤝 Draw'}
                </div>
                <div className={cn(
                  "text-2xl font-bold",
                  order.result === 'WON' ? "text-green-600" : 
                  order.result === 'LOST' ? "text-red-600" : 
                  "text-gray-600"
                )}>
                  {order.result === 'WON' ? '+' : order.result === 'LOST' ? '-' : ''}
                  ${Math.abs(pnl).toFixed(2)}
                  <span className="text-lg ml-2">
                    ({order.result === 'WON' ? '+' : order.result === 'LOST' ? '-' : ''}
                    {Math.abs(pnlPercentage).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Timeline</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Order Created</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm:ss")}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Expires At</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(order.expiresAt), "MMM dd, yyyy HH:mm:ss")}
                </div>
              </div>

              {order.settledAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Settled At</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(order.settledAt), "MMM dd, yyyy HH:mm:ss")}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Network & Additional Info */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Additional Information</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Network</div>
                <div className="font-medium">{order.network.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Order ID</div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{order.id.slice(0, 16)}...</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopy(order.id, "Order ID")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
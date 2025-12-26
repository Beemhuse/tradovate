import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  ExternalLink,
  Download,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Gift,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction, TransactionFilters } from "./types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface TransactionsSectionProps {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;
  onTransactionClick: (transaction: Transaction) => void;
}

const TransactionsSection = ({ 
  transactions, 
  filters, 
  isLoading, 
  onTransactionClick 
}: TransactionsSectionProps) => {
  const { toast } = useToast();

  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.status && filters.status !== "ALL" && transaction.status !== filters.status) {
      return false;
    }
    if (filters.type && filters.type !== "ALL" && transaction.type !== filters.type) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower) ||
        transaction.txHash?.toLowerCase().includes(searchLower) ||
        transaction.toAddress?.toLowerCase().includes(searchLower) ||
        transaction.accountNumber?.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }
    if (filters.startDate || filters.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      if (filters.startDate && transactionDate < new Date(filters.startDate)) return false;
      if (filters.endDate && transactionDate > new Date(filters.endDate)) return false;
    }
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <ArrowDownLeft className="h-3 w-3 text-green-600" />;
      case 'WITHDRAWAL': return <ArrowUpRight className="h-3 w-3 text-blue-600" />;
      case 'TRADE': return <TrendingUp className="h-3 w-3 text-purple-600" />;
      case 'BONUS': return <Gift className="h-3 w-3 text-yellow-600" />;
      case 'REFERRAL': return <Users className="h-3 w-3 text-cyan-600" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return "bg-green-500/10 text-green-700 border-green-500/30";
      case 'WITHDRAWAL': return "bg-blue-500/10 text-blue-700 border-blue-500/30";
      case 'TRADE': return "bg-purple-500/10 text-purple-700 border-purple-500/30";
      case 'BONUS': return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30";
      case 'REFERRAL': return "bg-cyan-500/10 text-cyan-700 border-cyan-500/30";
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />;
      case 'COMPLETED': return <CheckCircle className="h-3 w-3" />;
      case 'FAILED': return <XCircle className="h-3 w-3" />;
      case 'PROCESSING': return <Clock className="h-3 w-3" />;
      case 'REJECTED': return <XCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return "bg-yellow-500/20 text-yellow-700";
      case 'COMPLETED': return "bg-green-500/20 text-green-700";
      case 'FAILED': return "bg-red-500/20 text-red-700";
      case 'PROCESSING': return "bg-blue-500/20 text-blue-700";
      case 'REJECTED': return "bg-gray-500/20 text-gray-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const getAdminActionColor = (action: string) => {
    switch (action) {
      case 'APPROVED': return "bg-green-500/20 text-green-700";
      case 'REJECTED': return "bg-red-500/20 text-red-700";
      default: return "bg-gray-500/20 text-gray-700";
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <ArrowUpRight className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          {transactions.length === 0 ? "No transactions yet" : "No matching transactions found"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {transactions.length === 0 
            ? "Make your first deposit or trade to see transactions here" 
            : "Try adjusting your filters"}
        </p>
        <Button>
          Make Deposit
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Transaction</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-sm">{transaction.id.slice(0, 8)}...</div>
                  {transaction.txHash && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {transaction.txHash.slice(0, 12)}...
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("flex items-center gap-1", getTypeColor(transaction.type))}
                >
                  {getTypeIcon(transaction.type)}
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "font-semibold",
                  transaction.type === 'DEPOSIT' || transaction.type === 'BONUS' || transaction.type === 'REFERRAL'
                    ? "text-green-600"
                    : transaction.type === 'WITHDRAWAL' || transaction.type === 'WITHDRAWAL_FEE'
                    ? "text-red-600"
                    : "text-gray-600"
                )}>
                  {transaction.type === 'DEPOSIT' || transaction.type === 'BONUS' || transaction.type === 'REFERRAL' ? '+' : '-'}
                  ${transaction.amount.toFixed(2)}
                </div>
                {transaction.coin && (
                  <div className="text-xs text-muted-foreground">
                    {transaction.coin.symbol}
                  </div>
                )}
              </TableCell>
     
              <TableCell>
                <div className="space-y-1">
                  <Badge
                    variant="secondary"
                    className={cn("flex items-center gap-1", getStatusColor(transaction.status))}
                  >
                    {getStatusIcon(transaction.status)}
                    {transaction.status}
                  </Badge>
                  {transaction.adminAction !== 'NONE' && (
                    <Badge
                      variant="outline"
                      className={cn("text-xs", getAdminActionColor(transaction.adminAction))}
                    >
                      {transaction.adminAction}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {format(new Date(transaction.createdAt), "MMM dd")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.createdAt), "HH:mm")}
                  </div>
                </div>
              </TableCell>
          
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsSection;
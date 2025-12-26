import { TrendingUp, AlertCircle, CheckCircle, PauseCircle, Plus, Network, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TradingPair } from "./types";
import PairRow from "./PairRow";

interface PairsTableProps {
  pairs: TradingPair[];
  allPairs: TradingPair[];
  isLoading: boolean;
  onEditPair: (pair: TradingPair) => void;
  onTogglePair: (pair: TradingPair, checked: boolean) => void;
  onDeletePair: (pair: TradingPair) => void;
  sortBy: "name" | "volume" | "price" | "date";
  sortOrder: "asc" | "desc";
  onSort: (field: "name" | "volume" | "price" | "date") => void;
  isPatching: boolean;
  networkFilter: string;
  searchQuery: string;
  onCreatePairClick: () => void;
}

const PairsTable = ({
  pairs,
  allPairs,
  isLoading,
  onEditPair,
  onTogglePair,
  onDeletePair,
  sortBy,
  sortOrder,
  onSort,
  isPatching,
  networkFilter,
  searchQuery,
  onCreatePairClick,
}: PairsTableProps) => {
  const activePairs = allPairs.filter(p => p.isActive);
  const inactivePairs = allPairs.filter(p => !p.isActive);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Pairs</CardTitle>
          <CardDescription>Loading pairs...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-6 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pairs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No matching pairs found" : "No trading pairs yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Start by creating your first trading pair"}
            </p>
            <Button onClick={onCreatePairClick}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Pair
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Pairs</CardTitle>
            <CardDescription>
              {pairs.length} of {allPairs.length} pairs
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSort("name")}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    onClick={() => onSort("name")}
                    className="flex items-center gap-2 hover:bg-transparent p-0 h-auto font-medium"
                  >
                    Pair
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Network</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("price")}
                    className="flex items-center gap-2 hover:bg-transparent p-0 h-auto font-medium"
                  >
                    Last Price
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort("volume")}
                    className="flex items-center gap-2 hover:bg-transparent p-0 h-auto font-medium"
                  >
                    24h Volume
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair) => (
                <PairRow
                  key={pair.id}
                  pair={pair}
                  onEdit={onEditPair}
                  onToggle={onTogglePair}
                  onDelete={onDeletePair}
                  isPatching={isPatching}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {pairs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {pairs.length} of {allPairs.length} pairs
              {networkFilter !== "all" && ` on ${networkFilter}`}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium">{activePairs.length} active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="font-medium">{inactivePairs.length} inactive</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PairsTable;
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowUpDown, CheckCircle, Edit, ExternalLink, Info, Network, PauseCircle, Trash2, TrendingUp } from "lucide-react";
import React from "react";

export default function PairTable({ filteredPairs, handleSort, handleTogglePair, patching, handleEditPair, setSelectedPair, setIsDeleteDialogOpen }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">
            <Button
              variant="ghost"
              onClick={() => handleSort("name")}
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
              onClick={() => handleSort("price")}
              className="flex items-center gap-2 hover:bg-transparent p-0 h-auto font-medium"
            >
              Last Price
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => handleSort("volume")}
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
        {filteredPairs.map((pair: TradingPair) => (
          <TableRow key={pair.id} className="hover:bg-muted/50 group">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">
                      {pair.symbol?.split("/")[0]?.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500/20 border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-bold text-green-600">
                      $
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{pair.symbol}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>WS: {pair.wsSymbol}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {pair.baseCoin?.coin?.name}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-normal">
                <Network className="h-3 w-3 mr-1" />
                {pair.baseCoin?.network?.name}
              </Badge>
            </TableCell>
            <TableCell>
              {pair.lastPrice ? (
                <div>
                  <div className="font-medium">
                    $
                    {pair.lastPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </div>
                  {pair.priceChangePercent && (
                    <div
                      className={cn(
                        "text-xs flex items-center gap-1",
                        pair.priceChangePercent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {pair.priceChangePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingUp className="h-3 w-3 rotate-180" />
                      )}
                      {Math.abs(pair.priceChangePercent).toFixed(2)}%
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {pair.volume24h ? (
                <div className="font-medium">
                  $
                  {pair.volume24h.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Switch
                  checked={pair.isActive}
                  onCheckedChange={(checked) => handleTogglePair(pair, checked)}
                  disabled={patching}
                />
                <Badge
                  variant={pair.isActive ? "default" : "secondary"}
                  className={cn(
                    "min-w-[70px] justify-center",
                    pair.isActive
                      ? "bg-green-500/20 text-green-700 hover:bg-green-500/20 border-green-500/30"
                      : "bg-amber-500/20 text-amber-700 hover:bg-amber-500/20 border-amber-500/30"
                  )}
                >
                  {pair.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3 w-3 mr-1" />
                      Paused
                    </>
                  )}
                </Badge>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <span className="sr-only">Open menu</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleEditPair(pair)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Market
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPair(pair);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Pair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

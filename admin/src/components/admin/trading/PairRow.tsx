import { TrendingUp, Network, Edit, ExternalLink, Trash2, CheckCircle, PauseCircle } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TradingPair } from "./types";
import { Info } from "lucide-react";

interface PairRowProps {
  pair: TradingPair;
  onEdit: (pair: TradingPair) => void;
  onToggle: (pair: TradingPair, checked: boolean) => void;
  onDelete: (pair: TradingPair) => void;
  isPatching: boolean;
}

const PairRow = ({ pair, onEdit, onToggle, onDelete, isPatching }: PairRowProps) => {
  return (
    <TableRow className="hover:bg-muted/50 group">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="font-bold text-primary">
                {pair.symbol?.split("/")[0]?.charAt(0)}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500/20 border-2 border-background flex items-center justify-center">
              <span className="text-[10px] font-bold text-green-600">$</span>
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
          {pair.network?.name}
        </Badge>
      </TableCell>
      {/* <TableCell>
        {pair.lastPrice ? (
          <div>
            <div className="font-medium">
              ${pair.lastPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              })}
            </div>
            {pair.priceChangePercent && (
              <div className={cn(
                "text-xs flex items-center gap-1",
                pair.priceChangePercent >= 0
                  ? "text-green-600"
                  : "text-red-600"
              )}>
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
            ${pair.volume24h.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell> */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={pair.isActive}
            onCheckedChange={(checked) => onToggle(pair, checked)}
            disabled={isPatching}
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
            <DropdownMenuItem onClick={() => onEdit(pair)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Market
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(pair)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Pair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default PairRow;
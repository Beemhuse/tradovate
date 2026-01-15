import { Search, Filter, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  OrderFilters,
  TransactionFilters,
  TradeStatus,
  TradeResult,
  TradeDirection,
  TradePeriod,
  TransactionType,
  TransactionStatus,
} from "./types";

interface FiltersProps {
  activeTab: "orders" | "transactions";
  orderFilters: OrderFilters;
  transactionFilters: TransactionFilters;
  onOrderFilterChange: (filters: OrderFilters) => void;
  onTransactionFilterChange: (filters: TransactionFilters) => void;
}

const Filters = ({
  activeTab,
  orderFilters,
  transactionFilters,
  onOrderFilterChange,
  onTransactionFilterChange,
}: FiltersProps) => {
  const orderStatusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
    { value: "SETTLED", label: "Settled", color: "bg-green-500" },
  ];

  const orderResultOptions = [
    { value: "ALL", label: "All Results" },
    { value: "WIN", label: "Win", color: "bg-green-500" },
    { value: "LOSS", label: "Loss", color: "bg-red-500" },
    { value: "DRAW", label: "Draw", color: "bg-gray-500" },
  ];

  const orderDirectionOptions = [
    { value: "ALL", label: "All Directions" },
    { value: "BULLISH", label: "Bullish", color: "bg-green-500" },
    { value: "BEARISH", label: "Bearish", color: "bg-red-500" },
  ];

  const orderPeriodOptions = [
    { value: "ALL", label: "All Periods" },
    { value: "S30", label: "30 Seconds" },
    { value: "M1", label: "1 Minute" },
    { value: "M5", label: "5 Minutes" },
    { value: "M15", label: "15 Minutes" },
  ];

  const transactionTypeOptions = [
    { value: "ALL", label: "All Types" },
    { value: "DEPOSIT", label: "Deposit", color: "bg-green-500" },
    { value: "WITHDRAWAL", label: "Withdrawal", color: "bg-blue-500" },
    { value: "TRADE_OPEN", label: "Trade Open", color: "bg-purple-500" },
    { value: "TRADE_CLOSE", label: "Trade Close", color: "bg-purple-500" },
    { value: "TRADE_WIN", label: "Trade Win", color: "bg-green-500" },
    { value: "TRADE_PROFIT", label: "Trade Profit", color: "bg-green-500" },
    { value: "BONUS", label: "Bonus", color: "bg-yellow-500" },
    { value: "FEE", label: "Fee", color: "bg-red-500" },
    { value: "ADMIN_ADJUST", label: "Admin Adjustment", color: "bg-gray-500" },
  ];

  const transactionStatusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
    { value: "COMPLETED", label: "Completed", color: "bg-green-500" },
    { value: "FAILED", label: "Failed", color: "bg-red-500" },
    { value: "REJECTED", label: "Rejected", color: "bg-gray-500" },
  ];

  const timePeriodOptions = [
    { value: "ALL", label: "All Time" },
    { value: "TODAY", label: "Today" },
    { value: "WEEK", label: "This Week" },
    { value: "MONTH", label: "This Month" },
    { value: "YEAR", label: "This Year" },
  ];

  const handleClearFilters = () => {
    if (activeTab === "orders") {
      onOrderFilterChange({});
    } else {
      onTransactionFilterChange({});
    }
  };

  const currentFilters =
    activeTab === "orders" ? orderFilters : transactionFilters;
  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  const updateOrderFilter = (key: keyof OrderFilters, value: any) => {
    onOrderFilterChange({ ...orderFilters, [key]: value });
  };

  const updateTransactionFilter = (
    key: keyof TransactionFilters,
    value: any
  ) => {
    onTransactionFilterChange({ ...transactionFilters, [key]: value });
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "orders"
                ? "Search by coin, pair, ID..."
                : "Search by amount, ID, hash..."
            }
            value={currentFilters.search || ""}
            onChange={(e) => {
              if (activeTab === "orders")
                updateOrderFilter("search", e.target.value);
              else updateTransactionFilter("search", e.target.value);
            }}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={currentFilters.status || "ALL"}
          onValueChange={(value) => {
            const nextValue = value === "ALL" ? undefined : value;
            if (activeTab === "orders") updateOrderFilter("status", nextValue);
            else updateTransactionFilter("status", nextValue);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {(activeTab === "orders"
              ? orderStatusOptions
              : transactionStatusOptions
            ).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.color && (
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                  )}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tab Specific Filters */}
        {activeTab === "orders" ? (
          <>
            <Select
              value={orderFilters.direction || "ALL"}
              onValueChange={(value) =>
                updateOrderFilter(
                  "direction",
                  value === "ALL" ? undefined : value
                )
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {orderDirectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div
                          className={`w-2 h-2 rounded-full ${option.color}`}
                        />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={orderFilters.result || "ALL"}
              onValueChange={(value) =>
                updateOrderFilter("result", value === "ALL" ? undefined : value)
              }
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                {orderResultOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div
                          className={`w-2 h-2 rounded-full ${option.color}`}
                        />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <Select
            value={transactionFilters.type || "ALL"}
            onValueChange={(value) =>
              updateTransactionFilter(
                "type",
                value === "ALL" ? undefined : value
              )
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {transactionTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.color && (
                      <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full md:w-[240px] justify-start text-left font-normal",
                (currentFilters.startDate || currentFilters.endDate) &&
                  "border-primary"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {currentFilters.startDate || currentFilters.endDate ? (
                <>
                  {currentFilters.startDate
                    ? format(new Date(currentFilters.startDate), "MMM dd")
                    : ""}
                  {" - "}
                  {currentFilters.endDate
                    ? format(new Date(currentFilters.endDate), "MMM dd, yyyy")
                    : ""}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{
                from: currentFilters.startDate
                  ? new Date(currentFilters.startDate)
                  : undefined,
                to: currentFilters.endDate
                  ? new Date(currentFilters.endDate)
                  : undefined,
              }}
              onSelect={(range) => {
                const startDate = range?.from
                  ? format(range.from, "yyyy-MM-dd")
                  : undefined;
                const endDate = range?.to
                  ? format(range.to, "yyyy-MM-dd")
                  : undefined;
                if (activeTab === "orders") {
                  onOrderFilterChange({ ...orderFilters, startDate, endDate });
                } else {
                  onTransactionFilterChange({
                    ...transactionFilters,
                    startDate,
                    endDate,
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(currentFilters).map(([key, value]) => {
            if (!value || key === "search") return null;

            let label = "";
            let color = "bg-gray-100 text-gray-800";

            if (key === "status") {
              const option = (
                activeTab === "orders"
                  ? orderStatusOptions
                  : transactionStatusOptions
              ).find((opt) => opt.value === value);
              label = `Status: ${option?.label}`;
              color = "bg-blue-100 text-blue-800";
            } else if (key === "type" && activeTab === "transactions") {
              const option = transactionTypeOptions.find(
                (opt) => opt.value === value
              );
              label = `Type: ${option?.label}`;
              color = "bg-green-100 text-green-800";
            } else if (key === "direction" && activeTab === "orders") {
              const option = orderDirectionOptions.find(
                (opt) => opt.value === value
              );
              label = `Direction: ${option?.label}`;
              color =
                value === "BULLISH"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800";
            } else if (key === "result" && activeTab === "orders") {
              const option = orderResultOptions.find(
                (opt) => opt.value === value
              );
              label = `Result: ${option?.label}`;
              color =
                value === "WIN"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800";
            } else if (key === "startDate" || key === "endDate") {
              label = `${key === "startDate" ? "From" : "To"}: ${format(
                new Date(value as string),
                "MMM dd, yyyy"
              )}`;
              color = "bg-purple-100 text-purple-800";
            } else if (key === "period" && activeTab === "orders") {
              const option = orderPeriodOptions.find(
                (opt) => opt.value === value
              );
              label = `Period: ${option?.label}`;
              color = "bg-amber-100 text-amber-800";
            }

            return label ? (
              <Badge
                key={key}
                variant="secondary"
                className={cn(color, "font-normal")}
              >
                {label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default Filters;

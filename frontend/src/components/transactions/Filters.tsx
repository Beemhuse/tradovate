import { Search, Filter, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { OrderFilters, TransactionFilters } from "./types";

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
  const filters = activeTab === "orders" ? orderFilters : transactionFilters;
  const setFilters = activeTab === "orders" ? onOrderFilterChange : onTransactionFilterChange;

  const orderStatusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
    { value: "RUNNING", label: "Running", color: "bg-blue-500" },
    { value: "SETTLED", label: "Settled", color: "bg-green-500" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-gray-500" },
    { value: "EXPIRED", label: "Expired", color: "bg-red-500" },
  ];

  const orderResultOptions = [
    { value: "ALL", label: "All Results" },
    { value: "WON", label: "Won", color: "bg-green-500" },
    { value: "LOST", label: "Lost", color: "bg-red-500" },
    { value: "DRAW", label: "Draw", color: "bg-gray-500" },
  ];

  const orderDirectionOptions = [
    { value: "ALL", label: "All Directions" },
    { value: "BULLISH", label: "BULLISH", color: "bg-green-500" },
    { value: "BEARISH", label: "BEARISH", color: "bg-red-500" },
  ];

  const orderPeriodOptions = [
    { value: "ALL", label: "All Periods" },
    { value: "M1", label: "1 Minute" },
    { value: "M5", label: "5 Minutes" },
    { value: "M15", label: "15 Minutes" },
    { value: "H1", label: "1 Hour" },
    { value: "H4", label: "4 Hours" },
    { value: "D1", label: "1 Day" },
  ];

  const transactionTypeOptions = [
    { value: "ALL", label: "All Types" },
    { value: "DEPOSIT", label: "Deposit", color: "bg-green-500" },
    { value: "WITHDRAWAL", label: "Withdrawal", color: "bg-blue-500" },
    { value: "TRADE", label: "Trade", color: "bg-purple-500" },
    { value: "BONUS", label: "Bonus", color: "bg-yellow-500" },
    { value: "REFERRAL", label: "Referral", color: "bg-cyan-500" },
  ];

  const transactionStatusOptions = [
    { value: "ALL", label: "All Status" },
    { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
    { value: "COMPLETED", label: "Completed", color: "bg-green-500" },
    { value: "FAILED", label: "Failed", color: "bg-red-500" },
    { value: "PROCESSING", label: "Processing", color: "bg-blue-500" },
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
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

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
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "ALL"}
          onValueChange={(value) => setFilters({ 
            ...filters, 
            status: value === "ALL" ? undefined : value as any 
          })}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {activeTab === "orders" 
              ? orderStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))
              : transactionStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.color && (
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))
            }
          </SelectContent>
        </Select>

        {/* Type Filter */}
        {activeTab === "orders" ? (
          <>
            <Select
              value={filters.direction || "ALL"}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                direction: value === "ALL" ? undefined : value as any 
              })}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {orderDirectionOptions.map((option) => (
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

            <Select
              value={filters.result || "ALL"}
              onValueChange={(value) => setFilters({ 
                ...filters, 
                result: value === "ALL" ? undefined : value as any 
              })}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                {orderResultOptions.map((option) => (
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
          </>
        ) : (
          <Select
            value={filters.type || "ALL"}
            onValueChange={(value) => setFilters({ 
              ...filters, 
              type: value === "ALL" ? undefined : value as any 
            })}
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
                (filters.startDate || filters.endDate) && "border-primary"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {filters.startDate || filters.endDate ? (
                <>
                  {filters.startDate ? format(new Date(filters.startDate), "MMM dd") : ""}
                  {" - "}
                  {filters.endDate ? format(new Date(filters.endDate), "MMM dd, yyyy") : ""}
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
                from: filters.startDate ? new Date(filters.startDate) : undefined,
                to: filters.endDate ? new Date(filters.endDate) : undefined,
              }}
              onSelect={(range) => {
                setFilters({
                  ...filters,
                  startDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
                  endDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
                });
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
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === "search") return null;
            
            let label = "";
            let color = "bg-gray-100 text-gray-800";
            
            if (key === "status") {
              const option = (activeTab === "orders" ? orderStatusOptions : transactionStatusOptions)
                .find(opt => opt.value === value);
              label = `Status: ${option?.label}`;
              color = "bg-blue-100 text-blue-800";
            } else if (key === "type") {
              const option = transactionTypeOptions.find(opt => opt.value === value);
              label = `Type: ${option?.label}`;
              color = "bg-green-100 text-green-800";
            } else if (key === "direction") {
              const option = orderDirectionOptions.find(opt => opt.value === value);
              label = `Direction: ${option?.label}`;
              color = value === "UP" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
            } else if (key === "result") {
              const option = orderResultOptions.find(opt => opt.value === value);
              label = `Result: ${option?.label}`;
              color = value === "WON" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
            } else if (key === "startDate" || key === "endDate") {
              label = `${key === "startDate" ? "From" : "To"}: ${format(new Date(value), "MMM dd, yyyy")}`;
              color = "bg-purple-100 text-purple-800";
            } else if (key === "period") {
              const option = timePeriodOptions.find(opt => opt.value === value);
              label = `Period: ${option?.label}`;
              color = "bg-amber-100 text-amber-800";
            }
            
            return label ? (
              <Badge key={key} variant="secondary" className={cn(color, "font-normal")}>
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
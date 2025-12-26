import { CheckCircle, PauseCircle, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Plus } from "lucide-react";

interface ControlBarProps {
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  networkFilter: string;
  onNetworkFilterChange: (value: string) => void;
  networks: string[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreatePairClick: () => void;
}

const ControlBar = ({
  statusFilter,
  onStatusFilterChange,
  networkFilter,
  onNetworkFilterChange,
  networks,
  searchQuery,
  onSearchChange,
  onCreatePairClick,
}: ControlBarProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(v: "all" | "active" | "inactive") => onStatusFilterChange(v)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  All
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex items-center gap-2">
                  <PauseCircle className="h-4 w-4" />
                  Inactive
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Network Filter */}
            <Select value={networkFilter} onValueChange={onNetworkFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Networks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                {networks.map((network) => (
                  <SelectItem key={network} value={network}>
                    <div className="flex items-center gap-2">
                      <Network className="h-3 w-3" />
                      {network}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pairs, symbols..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Create Button */}
            <Button 
              onClick={onCreatePairClick}
              className="whitespace-nowrap bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Pair
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlBar;
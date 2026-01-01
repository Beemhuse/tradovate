// src/components/coin-management/NetworkCard.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Network } from "@/types/coins";

type Props = {
  network: Network;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

const NetworkCard: React.FC<Props> = ({ network, selected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(network.id)}
      className={`p-3 border rounded-lg text-left transition-colors w-full flex items-start gap-3 ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted"
      }`}
    >
      <img className="w-6 h-6" src={network.icon} />
      <div className="flex-1">
        <div className="font-medium text-sm">{network.name}</div>
        <div className="text-xs text-muted-foreground mt-1">{network.description}</div>
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {network.type || "Unknown"}
          </Badge>
        </div>
      </div>
    </button>
  );
};

export default NetworkCard;

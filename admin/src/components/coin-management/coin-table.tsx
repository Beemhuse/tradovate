// components/coin-management/CoinTable.tsx
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { MouseEvent } from "react";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  iconUrl?: string | null;
  isActive?: boolean;
  networks?: Array<{ contractAddress?: string }>;
};

interface CoinTableProps {
  coins: Coin[];
  onToggleStatus: (coin: Coin) => void;
  onEdit: (coin: Coin) => void;
  onDelete: (coin: Coin) => void;
}

const CoinTable = ({ coins, onToggleStatus, onEdit, onDelete }: CoinTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (coinId: string, e: MouseEvent) => {
    // Prevent navigation if clicking on buttons/links
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    navigate(`/admin/coins/${coinId}`);
  };

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  if (coins.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No coins found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4">Icon</th>
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Symbol</th>
            <th className="text-left py-3 px-4">Wallet Address</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr
              key={coin.id}
              className="border-b border-border hover:bg-secondary/50 cursor-pointer"
              onClick={(e) => handleRowClick(coin.id, e)}
            >
              <td className="py-4 px-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xl font-bold">
                    {coin.iconUrl ? (
                      <img
                        src={coin.iconUrl}
                        alt={coin.symbol}
                        className="h-6 w-6"
                      />
                    ) : (
                      coin.symbol?.[0]
                    )}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 font-medium">{coin.name}</td>
              <td className="py-4 px-4 text-muted-foreground">
                {coin.symbol}
              </td>
              <td className="py-4 px-4 font-mono text-sm">
                {coin.networks?.[0]?.contractAddress || "-"}
              </td>
              <td className="py-4 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    coin.isActive
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {coin.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-4 px-4" onClick={handleActionClick}>
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    title="Edit details"
                    onClick={() => onEdit(coin)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(coin);
                    }}
                  >
                    {coin.isActive ? (
                      <ToggleRight className="h-4 w-4 text-success" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(coin);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinTable;
// src/components/admin/TransactionRow.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";

type Props = {
  tx: any;
  onAction: (id: string, action: "approve" | "reject" | "hold") => void;
  isMutating: boolean;
};

const TransactionRow: React.FC<Props> = ({ tx, onAction, isMutating }) => {
  return (
    <tr key={tx.id} className="border-b border-border hover:bg-secondary/50">
      <td className="py-4 px-4 capitalize">{tx.type}</td>
      <td className="py-4 px-4">{tx.coins?.symbol}</td>
      <td className="py-4 px-4 text-right font-mono">{Number(tx.amount).toFixed(8)}</td>
      <td className="py-4 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            tx.status === "approved"
              ? "bg-success/10 text-success"
              : tx.status === "rejected"
              ? "bg-danger/10 text-danger"
              : tx.status === "on_hold"
              ? "bg-warning/10 text-warning"
              : "bg-primary/10 text-primary"
          }`}
        >
          {tx.status}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-muted-foreground">
        {new Date(tx.created_at).toLocaleDateString()}
      </td>
      <td className="py-4 px-4">
        {tx.status === "pending" && (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-success"
              disabled={isMutating}
              onClick={() => onAction(tx.id, "approve")}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-warning"
              disabled={isMutating}
              onClick={() => onAction(tx.id, "hold")}
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger"
              disabled={isMutating}
              onClick={() => onAction(tx.id, "reject")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default TransactionRow;

// src/components/admin/TransactionTable.tsx
import React from "react";
import TransactionRow from "./transaction-row";

type Props = {
  transactions: any[] | undefined;
  onAction: (id: string, action: "approve" | "reject" | "hold") => void;
  isMutating: boolean;
};

const TransactionTable: React.FC<Props> = ({ transactions, onAction, isMutating }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4">Type</th>
            <th className="text-left py-3 px-4">Coin</th>
            <th className="text-right py-3 px-4">Amount</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-right py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions?.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onAction={onAction} isMutating={isMutating} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;

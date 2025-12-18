// components/coin-management/CoinCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface CoinCardProps {
  title: string;
  children: ReactNode;
}

const CoinCard = ({ title, children }: CoinCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default CoinCard;
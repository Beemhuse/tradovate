export type TradeDirection = "BUY" | "SELL";

export type TradePayload = {
  pairId: string;
  type: TradeDirection;
  amount: number;
  price: number;
};

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string;
}

export interface Network {
  id: string;
  name: string;
  type: string;
  explorerUrl?: string;
}

export interface MarketPair {
  id: string;
  symbol: string;
  baseCoin: Coin;
  quoteCoin: Coin;
}

export interface Wallet {
  id: string;
  address: string;
  network: Network;
}

export enum TradeDirection {
  BULLISH = "BULLISH",
  BEARISH = "BEARISH",
}

export enum TradePeriod {
  S30 = "S30",
  M1 = "M1",
  M5 = "M5",
  M15 = "M15",
}

export enum TradeResult {
  WIN = "WIN",
  LOSS = "LOSS",
  DRAW = "DRAW",
}

export enum TradeStatus {
  PENDING = "PENDING",
  SETTLED = "SETTLED",
}

export interface Order {
  id: string;
  userId: string;
  marketPairId: string;
  tradeConfigId: string;
  direction: TradeDirection;
  stake: number;
  entryPrice: number;
  profitRate: number;
  expiresAt: string;
  settledAt?: string;
  result?: TradeResult;
  status: TradeStatus;
  createdAt: string;
  user?: User;
  marketPair: MarketPair & {
    baseCoin: Coin;
    quoteCoin: Coin;
    network: Network;
  };
  tradeConfig: {
    id: string;
    period: TradePeriod;
    profitRate: number;
  };
  pnl?: number; // Calculated on frontend
}

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRADE_OPEN = "TRADE_OPEN",
  TRADE_CLOSE = "TRADE_CLOSE",
  TRADE_WIN = "TRADE_WIN",
  TRADE_PROFIT = "TRADE_PROFIT",
  BONUS = "BONUS",
  FEE = "FEE",
  ADMIN_ADJUST = "ADMIN_ADJUST",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
}

export enum AdminAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NONE = "NONE",
}

export interface Transaction {
  id: string;
  userId: string;
  walletId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  txHash?: string;
  toAddress?: string;
  createdAt: string;
  updatedAt: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  adminId?: string;
  adminAction: AdminAction;
  adminMessage?: string;
  user: User;
  wallet?: Wallet;
  coin?: Coin; // If transaction is coin-specific
  network?: Network; // If transaction is network-specific
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalDeposits: number;
  totalWithdrawals: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalStake: number;
  totalWins: number;
  totalLosses: number;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | "ALL";
  status?: TransactionStatus | "ALL";
  period?: "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount" | "type";
  sortOrder?: "asc" | "desc";
}

export interface OrderFilters {
  search?: string;
  status?: TradeStatus | "ALL";
  result?: TradeResult | "ALL";
  period?: TradePeriod | "ALL";
  direction?: TradeDirection | "ALL";
  startDate?: string;
  endDate?: string;
  pairId?: string;
  sortBy?: "date" | "stake" | "profit";
  sortOrder?: "asc" | "desc";
}

export interface Stats {
  totalOrders: number;
  activeOrders: number;
  totalStake: number;
  totalPnl: number;
  winRate: number;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
}

export interface PeriodStats {
  label: string;
  orders: number;
  transactions: number;
  volume: number;
}

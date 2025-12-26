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
  UP = 'UP',
  DOWN = 'DOWN'
}

export enum TradePeriod {
  M1 = 'M1', // 1 minute
  M5 = 'M5', // 5 minutes
  M15 = 'M15', // 15 minutes
  H1 = 'H1', // 1 hour
  H4 = 'H4', // 4 hours
  D1 = 'D1'  // 1 day
}

export enum TradeResult {
  WON = 'WON',
  LOST = 'LOST',
  DRAW = 'DRAW'
}

export enum TradeStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface Order {
  id: string;
  userId: string;
  coinId: string;
  networkId: string;
  pairId?: string;
  direction: TradeDirection;
  period: TradePeriod;
  stake: number;
  entryPrice: number;
  profitRate: number;
  expiresAt: string;
  settledAt?: string;
  result?: TradeResult;
  status: TradeStatus;
  createdAt: string;
  user: User;
  coin: Coin;
  network: Network;
  pair?: MarketPair;
  currentPrice?: number; // For real-time updates
  pnl?: number; // Profit & Loss
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRADE = 'TRADE',
  BONUS = 'BONUS',
  REFERRAL = 'REFERRAL',
  WITHDRAWAL_FEE = 'WITHDRAWAL_FEE',
  OTHER = 'OTHER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED'
}

export enum AdminAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NONE = 'NONE'
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

export interface Filters {
  search?: string;
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  period?: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: TradeStatus | 'ALL';
  result?: TradeResult | 'ALL';
  period?: TradePeriod | 'ALL';
  direction?: TradeDirection | 'ALL';
  startDate?: string;
  endDate?: string;
  pairId?: string;
  sortBy?: 'date' | 'stake' | 'profit';
  sortOrder?: 'asc' | 'desc';
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
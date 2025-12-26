import { Order, Transaction, OrderFilters, TransactionFilters } from "./types";

export const filterOrders = (orders: Order[], filters: OrderFilters): Order[] => {
  if (!orders || !Array.isArray(orders)) return [];
  
  return orders.filter(order => {
    if (filters.status && filters.status !== "ALL" && order.status !== filters.status) {
      return false;
    }
    if (filters.result && filters.result !== "ALL" && order.result !== filters.result) {
      return false;
    }
    if (filters.direction && filters.direction !== "ALL" && order.direction !== filters.direction) {
      return false;
    }
    if (filters.period && filters.period !== "ALL" && order.period !== filters.period) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        order.id.toLowerCase().includes(searchLower) ||
        order.coin.symbol.toLowerCase().includes(searchLower) ||
        order.coin.name.toLowerCase().includes(searchLower) ||
        order.pair?.symbol.toLowerCase().includes(searchLower) ||
        order.stake.toString().includes(searchLower);
      if (!matches) return false;
    }
    if (filters.startDate || filters.endDate) {
      const orderDate = new Date(order.createdAt);
      if (filters.startDate && orderDate < new Date(filters.startDate)) return false;
      if (filters.endDate && orderDate > new Date(filters.endDate)) return false;
    }
    return true;
  });
};

export const filterTransactions = (transactions: Transaction[], filters: TransactionFilters): Transaction[] => {
  if (!transactions || !Array.isArray(transactions)) return [];
  
  return transactions.filter(transaction => {
    if (filters.status && filters.status !== "ALL" && transaction.status !== filters.status) {
      return false;
    }
    if (filters.type && filters.type !== "ALL" && transaction.type !== filters.type) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = 
        transaction.id.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower) ||
        transaction.txHash?.toLowerCase().includes(searchLower) ||
        transaction.toAddress?.toLowerCase().includes(searchLower) ||
        transaction.accountNumber?.toLowerCase().includes(searchLower);
      if (!matches) return false;
    }
    if (filters.startDate || filters.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      if (filters.startDate && transactionDate < new Date(filters.startDate)) return false;
      if (filters.endDate && transactionDate > new Date(filters.endDate)) return false;
    }
    return true;
  });
};

export const sortOrders = (
  orders: Order[], 
  sortBy: 'date' | 'stake' | 'profit', 
  sortOrder: 'asc' | 'desc'
): Order[] => {
  return [...orders].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'stake':
        aValue = a.stake;
        bValue = b.stake;
        break;
      case 'profit':
        aValue = a.pnl || 0;
        bValue = b.pnl || 0;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });
};

export const sortTransactions = (
  transactions: Transaction[], 
  sortBy: 'date' | 'amount' | 'type', 
  sortOrder: 'asc' | 'desc'
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const calculateStats = (orders: Order[], transactions: Transaction[]) => {
  const activeOrders = orders.filter(o => 
    o.status === 'PENDING' || o.status === 'RUNNING'
  ).length;
  
  const settledOrders = orders.filter(o => o.status === 'SETTLED');
  const wonOrders = settledOrders.filter(o => o.result === 'WON');
  const lostOrders = settledOrders.filter(o => o.result === 'LOST');
  
  const totalStake = orders.reduce((sum, order) => sum + order.stake, 0);
  const totalPnl = orders.reduce((sum, order) => sum + (order.pnl || 0), 0);
  
  const totalDeposits = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const pendingTransactions = transactions
    .filter(t => t.status === 'PENDING' || t.status === 'PROCESSING')
    .length;

  return {
    totalOrders: orders.length,
    activeOrders,
    totalStake,
    totalPnl,
    winRate: settledOrders.length > 0 ? (wonOrders.length / settledOrders.length) * 100 : 0,
    totalTransactions: transactions.length,
    totalDeposits,
    totalWithdrawals,
    pendingTransactions,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getTimeLeft = (expiresAt: string): string => {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = Math.max(0, expires - now);
  
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
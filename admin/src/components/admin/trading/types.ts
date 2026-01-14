export interface Coin {
  id: string;
  coin: {
    symbol: string;
    name: string;
  };
  network: {
    id: string;
    name: string;
  };
}

export interface TradingPair {
  id: string;
  symbol: string;
  wsSymbol: string;
  baseCoin: Coin;
  quoteCoin: Coin;
  isActive: boolean;
  lastPrice?: number;
  priceChangePercent?: number;
  volume24h?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalVolume: number;
  averagePrice: number;
  activePercentage: number;
}

export interface AdminTradingPairsProps {
  // Props if needed for parent component
}

// ./types.ts
export interface CreatePairFormData {
  baseCoinNetworkId: string;
  quoteCoinNetworkId: string;

  period: "S30" | "M1" | "M5" | "M15";
  direction: "BULLISH" | "BEARISH";
  minStake: number;
  maxStake: number;
  profitRate: number;
  isActive?: boolean;
}


export interface Network {
  id: string;
  name: string;
  type: 'Native' | 'EVM' | 'TRC' | 'BEP' | 'Other';
  isActive: boolean;
  rpcUrl?: string;
  explorerUrl?: string;
  chainId?: number;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Coin Network (the bridge between coin and network)
export interface CoinNetwork {
  id: string;
  coinId: string;
  networkId: string;
  contractAddress: string;
  decimals: number;
  isActive: boolean;
  qrCode: string;
  minDepositAmount?: number;
  minWithdrawalAmount?: number;
  withdrawalFee?: number;
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  network: Network;
  createdAt?: string;
  updatedAt?: string;
}
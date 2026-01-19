export interface Coin {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string;
}

export interface TradingPair {
  id: string;
  symbol: string;
  wsSymbol: string;
  isActive: boolean;
  network: {
    id: string;
    name: string;
    icon?: string;
  };
  baseCoin: Coin;
  quoteCoin: Coin;
  lastPrice?: number;
  priceChangePercent?: number;
  volume24h?: number;
  minStake?: number;
  maxStake?: number;
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
  minStake: number;
  maxStake: number;
  isActive?: boolean;
}

export interface UpdatePairFormData {
  minStake?: number;
  maxStake?: number;
  pricePrecision?: number;
  quantityPrecision?: number;
  minTradeAmount?: number;
}

export interface Network {
  id: string;
  name: string;
  type: "Native" | "EVM" | "TRC" | "BEP" | "Other";
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

// src/types/coin.ts
export type Network = {
  id: string;
  name: string;
  type?: string;
  chainId?: string;
  icon?: string;
  description?: string;
};

export type CoinNetworkLink = {
  id: string;
  contractAddress?: string | null;
  decimals?: number | null;
  network?: Network | null;
};

export type Coin = {
  id: string;
  name: string;
  symbol: string;
  iconUrl?: string | null;
  isActive?: boolean;
  networks?: CoinNetworkLink[];
  _count?: {
    wallets?: number;
    orders?: number;
    networks?: number;
  };
};

export type CreateCoinPayload = {
  symbol: string;
  name: string;
  iconUrl?: string;
  isActive?: boolean;
  networkName?: string;
  networkType?: string;
  contractAddress?: string;
  decimals?: number;
};

export type UpdateCoinPayload = {
  id: string;
  name?: string;
  symbol?: string;
  iconUrl?: string;
  isActive?: boolean;
};

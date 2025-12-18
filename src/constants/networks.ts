// src/constants/networks.ts

import { Network } from "@/types/coins";

export const HARDCODED_NETWORKS: Network[] = [
  { id: "ethereum", name: "Ethereum Mainnet", type: "ERC20", chainId: "1", icon: "🔷", description: "Ethereum blockchain with ERC-20 tokens" },
  { id: "bsc", name: "Binance Smart Chain", type: "BEP20", chainId: "56", icon: "💛", description: "Binance Smart Chain with BEP-20 tokens" },
  { id: "polygon", name: "Polygon", type: "ERC20", chainId: "137", icon: "🟣", description: "Polygon (Matic) network" },
  { id: "arbitrum", name: "Arbitrum", type: "ERC20", chainId: "42161", icon: "🔵", description: "Arbitrum L2 network" },
  { id: "optimism", name: "Optimism", type: "ERC20", chainId: "10", icon: "🔴", description: "Optimism L2 network" },
  { id: "avalanche", name: "Avalanche", type: "ERC20", chainId: "43114", icon: "❄️", description: "Avalanche C-Chain" },
  { id: "fantom", name: "Fantom", type: "ERC20", chainId: "250", icon: "🌀", description: "Fantom Opera network" },
  { id: "base", name: "Base", type: "ERC20", chainId: "8453", icon: "⬆️", description: "Base network (Coinbase L2)" },
  { id: "solana", name: "Solana", type: "SPL", icon: "⚡", description: "Solana blockchain with SPL tokens" },
  { id: "tron", name: "Tron", type: "TRC20", icon: "🟢", description: "Tron blockchain with TRC-20 tokens" },
  { id: "bitcoin", name: "Bitcoin", type: "Native", icon: "₿", description: "Bitcoin native network" },
  { id: "litecoin", name: "Litecoin", type: "Native", icon: "Ł", description: "Litecoin native network" },
  { id: "ripple", name: "Ripple", type: "Native", icon: "X", description: "Ripple (XRP) native network" },
  { id: "dogecoin", name: "Dogecoin", type: "Native", icon: "🐕", description: "Dogecoin native network" },
];

import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";

// Schemas
const createCoinSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().min(1),
  iconUrl: z.string().optional(),
  isActive: z.boolean().optional(),
});

const createNetworkSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
});

const linkCoinNetworkSchema = z.object({
  coinId: z.string(),
  networkId: z.string(),
  contractAddress: z.string().optional(),
});

// Coin Management
export const createCoin = async (req: Request, res: Response) => {
  try {
    const data = createCoinSchema.parse(req.body);
    const coin = await prisma.coin.create({ data });
    res.json(coin);
  } catch (error) {
    res.status(400).json({ error: "Invalid data or coin already exists" });
  }
};

export const updateCoin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = createCoinSchema.partial().parse(req.body);
    const coin = await prisma.coin.update({ where: { id }, data });
    res.json(coin);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
};

export const deleteCoin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coin.delete({ where: { id } });
    res.json({ message: "Coin deleted" });
  } catch (error) {
    res.status(400).json({ error: "Delete failed" });
  }
};

// Network Management
export const createNetwork = async (req: Request, res: Response) => {
  try {
    const data = createNetworkSchema.parse(req.body);
    const network = await prisma.network.create({ data });
    res.json(network);
  } catch (error) {
    res.status(400).json({ error: "Creation failed" });
  }
};

export const linkCoinToNetwork = async (req: Request, res: Response) => {
  try {
    const data = linkCoinNetworkSchema.parse(req.body);
    const link = await prisma.coinNetwork.create({ data });
    res.json(link);
  } catch (error) {
    res.status(400).json({ error: "Linking failed" });
  }
};

// User Management
export const getAllUsersWithWallets = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        wallets: {
          include: { coin: true },
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove passwords before sending (though prisma excludes usually if not selected, but include selects all)
    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const updateWalletSchema = z.object({
  walletId: z.string(),
  balance: z.number().optional(),
});

export const updateUserWallet = async (req: Request, res: Response) => {
  try {
    const { walletId, balance } = updateWalletSchema.parse(req.body);

    const wallet = await prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: balance !== undefined ? balance : undefined,
      },
      include: { coin: true },
    });

    res.json(wallet);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
};

import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { z } from "zod";
import QRCode from "qrcode";

const createWalletSchema = z.object({
  coinId: z.string(),
});

const withdrawSchema = z.object({
  walletId: z.string(),
  amount: z.number().positive(),
  toAddress: z.string().min(1),
});

const depositSchema = z.object({
  walletId: z.string(),
  amount: z.number().positive(),
  txHash: z.string().optional(),
});

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: { coin: true },
    });

    // Attach QR Code to each wallet response
    const walletsWithQr = await Promise.all(
      wallets.map(async (w) => {
        let qrCode = "";
        if (w.address) {
          try {
            qrCode = await QRCode.toDataURL(w.address);
          } catch (e) {
            console.error("QR Gen Error", e);
          }
        }
        return { ...w, qrCode };
      })
    );

    res.json(walletsWithQr);
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};

export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { coinId } = createWalletSchema.parse(req.body);

    // Check if wallet exists
    const existing = await prisma.wallet.findUnique({
      where: { userId_coinId: { userId, coinId } },
    });

    if (existing) return res.json(existing);

    // Mock Address Gen
    const address = `0x${Math.random().toString(16).substr(2, 40)}`;

    const wallet = await prisma.wallet.create({
      data: { userId, coinId, address },
    });

    // Generate QR
    const qrCode = await QRCode.toDataURL(address);

    res.json({ ...wallet, qrCode });
  } catch (error) {
    res.status(400).json({ error: "Failed to create wallet" });
  }
};

export const requestDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { walletId, amount, txHash } = depositSchema.parse(req.body);

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet || wallet.userId !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    // Create Transaction
    const tx = await prisma.transaction.create({
      data: {
        userId,
        walletId,
        type: "DEPOSIT",
        amount,
        txHash: txHash || `mock_tx_${Date.now()}`,
        status: "PENDING",
      },
    });

    res.json(tx);
  } catch (error) {
    res.status(400).json({ error: "Deposit request failed" });
  }
};

export const requestWithdraw = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { walletId, amount, toAddress } = withdrawSchema.parse(req.body);

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet || wallet.userId !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    if (wallet.balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });

    // Debit Balance (Lock funds ideally)
    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } },
    });

    const tx = await prisma.transaction.create({
      data: {
        userId,
        walletId,
        type: "WITHDRAW",
        amount,
        toAddress,
        status: "PENDING",
      },
    });

    res.json(tx);
  } catch (error) {
    res.status(400).json({ error: "Withdraw request failed" });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { wallet: { include: { coin: true } } },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};

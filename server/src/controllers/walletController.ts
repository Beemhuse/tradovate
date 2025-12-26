import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { z } from "zod";
import QRCode from "qrcode";
import { enforceFinancialAccess } from "../utils/accessGuard";

const createWalletSchema = z.object({
  coinId: z.string(),
  networkId: z.string().optional().nullable(),
  contractAddress: z.string().optional().nullable(),
});
const withdrawSchema = z.object({
  walletId: z.string(),
  amount: z.number().positive(),
  toAddress: z.string().min(1),
});
const bankWithdrawSchema = z.object({
  walletId: z.string().optional(), // bank withdraw may not need a crypto wallet
  amount: z.number().positive(),
  bankName: z.string().min(2),
  accountName: z.string().min(2),
  accountNumber: z.string().min(6),
  ifscCode: z.string().min(3),
});
const depositSchema = z.object({
  walletId: z.string(),
  amount: z.number().positive(),
  txHash: z.string().optional(),
});

type WalletWithCoin = {
  id: string;
  userId: string;
  coinId: string;
  balance: number;
  address: string | null;
  coin: {
    id: string;
    symbol: string;
    name: string;
    iconUrl: string | null;
    isActive: boolean;
  };
};
export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: {
        coin: true,
        network: true,
      },
      orderBy: [{ coin: { name: "asc" } }, { network: { name: "asc" } }],
    });

    const assets = await Promise.all(
      wallets.map(async (wallet) => {
        let qrCode = "";

        if (wallet.address) {
          try {
            qrCode = await QRCode.toDataURL(wallet.address);
          } catch (err) {
            console.error("QR Gen Error:", err);
          }
        }

        return {
          walletId: wallet.id,
          balance: wallet.balance,
          coin: {
            id: wallet.coin.id,
            name: wallet.coin.name,
            symbol: wallet.coin.symbol,
            iconUrl: wallet.coin.iconUrl,
          },

          network: wallet.network
            ? {
                id: wallet.network.id,
                name: wallet.network.name,
              }
            : null,

          address: wallet.address,
          qrCode,
          // createdAt: wallet.updatedAt,
        };
      })
    );

    return res.json({
      success: true,
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error("getAssets error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch assets",
    });
  }
};

export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, networkId } = createWalletSchema.parse(req.body);
    const userId = req.user!.userId;

    if (!networkId) {
      return res.status(400).json({
        success: false,
        error: "Network is required to create a wallet",
      });
    }
    /* 1️⃣ Validate user + KYC */
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, suspended: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.suspended) {
      return res.status(403).json({
        success: false,
        error: "Account suspended",
      });
    }

    if (user.kycStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        error: "KYC verification required",
        kycStatus: user.kycStatus,
      });
    }

    /* 2️⃣ Resolve CoinNetwork FIRST */
    const coinNetwork = await prisma.coinNetwork.findFirst({
      where: {
        coinId,
        networkId, // now guaranteed string
        isActive: true,
        contractAddress: { not: null },
      },
      include: { coin: true, network: true },
    });

    if (!coinNetwork) {
      return res.status(400).json({
        success: false,
        error: "No deposit address configured for this network",
      });
    }

    /* 3️⃣ Check wallet uniqueness (STRICT) */
    const existingWallet = await prisma.wallet.findUnique({
      where: {
        userId_coinId_networkId: {
          userId,
          coinId,
          networkId: coinNetwork.networkId,
        },
      },
      include: { coin: true, network: true },
    });

    if (existingWallet) {
      return res.json({
        success: true,
        message: "Wallet already exists",
        wallet: {
          ...existingWallet,
          qrCode: existingWallet.address
            ? await QRCode.toDataURL(existingWallet.address)
            : null,
          coinName: existingWallet.coin.name,
          coinSymbol: existingWallet.coin.symbol,
          networkName: existingWallet.network?.name ?? "N/A",
        },
      });
    }

    /* 4️⃣ Create wallet */
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        coinId,
        networkId: coinNetwork.networkId,
        address: coinNetwork.contractAddress,
        balance: 0,
      },
      include: { coin: true, network: true },
    });

    /* 5️⃣ Generate QR */
    const qrCode = await QRCode.toDataURL(wallet.address!);

    return res.status(201).json({
      success: true,
      message: "Wallet created successfully",
      wallet: {
        ...wallet,
        qrCode,
        coinName: wallet.coin.name,
        coinSymbol: wallet.coin.symbol,
        networkName: wallet.network?.name ?? "N/A",
      },
    });
  } catch (error: any) {
    console.error("Create wallet error:", error);

    // ✅ Gracefully handle race condition
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: "Wallet already exists for this network",
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to create wallet",
    });
  }
};

export const getUserWallets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Check user's KYC status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    if (user?.kycStatus !== "APPROVED") {
      return res.status(403).json({
        success: false,
        error: "KYC verification required",
        message: "Please complete KYC verification to view wallets",
        kycStatus: user?.kycStatus,
      });
    }

    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: {
        coin: true,
        network: true,
      },
      orderBy: { coin: { name: "asc" } },
    });

    // Generate QR codes
    const walletsWithQr = await Promise.all(
      wallets.map(async (wallet) => {
        const qrCode = wallet.address
          ? await QRCode.toDataURL(wallet.address)
          : null;
        return {
          ...wallet,
          qrCode,
          coinName: wallet.coin.name,
          coinSymbol: wallet.coin.symbol,
          networkName: wallet.network?.name,
        };
      })
    );

    res.json({
      success: true,
      kycVerified: true,
      count: wallets.length,
      wallets: walletsWithQr,
    });
  } catch (error) {
    console.error("Get user wallets error:", error);
    res.status(500).json({
      error: "Failed to fetch wallets",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
// Get wallet by ID
export const getWalletById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const wallet = await prisma.wallet.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        coin: true,
        network: true,
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found",
        details:
          "Wallet does not exist or you don't have permission to access it",
      });
    }

    const qrCode = wallet.address
      ? await QRCode.toDataURL(wallet.address)
      : null;

    res.json({
      success: true,
      wallet: {
        ...wallet,
        qrCode,
        coinName: wallet.coin.name,
        coinSymbol: wallet.coin.symbol,
        networkName: wallet.network?.name,
      },
    });
  } catch (error) {
    console.error("Get wallet by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch wallet",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update wallet balance
const updateWalletSchema = z.object({
  balance: z.number().min(0),
});

export const updateWalletBalance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { balance } = updateWalletSchema.parse(req.body);

    // Check if user owns the wallet or is admin
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    // Only allow if user owns the wallet or is admin
    if (wallet.userId !== userId && user?.role !== "ADMIN") {
      return res.status(403).json({
        error: "Forbidden",
        details: "You don't have permission to update this wallet",
      });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: { balance },
      include: {
        coin: true,
        network: true,
      },
    });

    res.json({
      success: true,
      message: "Wallet balance updated",
      wallet: updatedWallet,
    });
  } catch (error) {
    console.error("Update wallet balance error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to update wallet balance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get deposit address for a specific coin
export const getDepositAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { coinId } = req.params;
    const { networkId, contractAddress } = req.query;

    // Find or create wallet for this coin
    const whereCondition: any = {
      userId,
      coinId,
    };

    if (networkId && typeof networkId === "string") {
      whereCondition.networkId = networkId;
    } else {
      whereCondition.networkId = null;
    }

    if (contractAddress && typeof contractAddress === "string") {
      whereCondition.contractAddress = contractAddress;
    } else {
      whereCondition.contractAddress = null;
    }

    let wallet = await prisma.wallet.findFirst({
      where: whereCondition,
      include: {
        coin: true,
        network: true,
      },
    });

    // If wallet doesn't exist, get the admin address
    if (!wallet) {
      const coinNetworkWhere: any = { coinId };

      if (networkId && typeof networkId === "string") {
        coinNetworkWhere.networkId = networkId;
      } else {
        coinNetworkWhere.networkId = null;
      }

      const coinNetwork = await prisma.coinNetwork.findFirst({
        where: coinNetworkWhere,
        include: {
          coin: true,
          network: true,
        },
      });

      if (!coinNetwork?.contractAddress) {
        return res.status(404).json({
          error: "No deposit address available",
          message: "This coin is not configured for deposits",
        });
      }

      // Return the address without creating a wallet
      const qrCode = await QRCode.toDataURL(coinNetwork.contractAddress);

      return res.json({
        success: true,
        address: coinNetwork.contractAddress,
        qrCode,
        coinName: coinNetwork.coin.name,
        coinSymbol: coinNetwork.coin.symbol,
        networkName: coinNetwork.network?.name,
        note: "Create a wallet to track your balance",
      });
    }

    // Wallet exists, return its address
    const qrCode = wallet.address
      ? await QRCode.toDataURL(wallet.address)
      : null;

    res.json({
      success: true,
      address: wallet.address,
      qrCode,
      coinName: wallet.coin.name,
      coinSymbol: wallet.coin.symbol,
      networkName: wallet.network?.name,
      walletId: wallet.id,
    });
  } catch (error) {
    console.error("Get deposit address error:", error);
    res.status(500).json({
      error: "Failed to get deposit address",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const requestDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!(await enforceFinancialAccess(userId, res))) return;

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
    if (!(await enforceFinancialAccess(userId, res))) return;

    const { walletId, amount, toAddress } = withdrawSchema.parse(req.body);

    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });

    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Lock funds (debit user)
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

    res.json({
      success: true,
      message: "Withdraw request submitted",
      transaction: tx,
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(400).json({ error: "Withdraw request failed" });
  }
};

export const requestBankWithdraw = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!(await enforceFinancialAccess(userId, res))) return;

    const { walletId, amount, bankName, accountName, accountNumber, ifscCode } =
      bankWithdrawSchema.parse(req.body);

    // BANK withdraw must still deduct from a user's wallet balance.
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId! } });

    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized wallet access" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Debit funds
    await prisma.wallet.update({
      where: { id: walletId! },
      data: { balance: { decrement: amount } },
    });

    const tx = await prisma.transaction.create({
      data: {
        userId,
        walletId,
        type: "BANK_WITHDRAW",
        amount,
        status: "PENDING",
        bankName,
        accountName,
        accountNumber,
        ifscCode,
      },
    });

    return res.json({
      success: true,
      message: "Bank withdrawal request submitted",
      transaction: tx,
    });
  } catch (error) {
    console.error("Bank withdraw error:", error);
    return res.status(400).json({
      error: "Bank withdrawal request failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
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

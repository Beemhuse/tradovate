import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { AuthRequest } from "../middlewares/authMiddleware";

const createPairSchema = z.object({
  baseCoinNetworkId: z.string().uuid(),
  quoteCoinNetworkId: z.string().uuid(),

  period: z.enum(["S30", "M1", "M5", "M15"]),
  direction: z.enum(["BULLISH", "BEARISH"]),
  minStake: z.number().positive(),
  maxStake: z.number().positive(),
  profitRate: z.number().positive(),
  isActive: z.boolean().optional(),
});

const updatePairSchema = z.object({
  isActive: z.boolean().optional(),
});
export const createPair = async (req: Request, res: Response) => {
  try {
    const {
      baseCoinNetworkId,
      quoteCoinNetworkId,
      period,
      direction,
      minStake,
      maxStake,
      profitRate,
      isActive,
    } = createPairSchema.parse(req.body);

    if (minStake >= maxStake) {
      return res.status(400).json({
        error: "minStake must be less than maxStake",
      });
    }

    const [base, quote] = await Promise.all([
      prisma.coinNetwork.findUnique({
        where: { id: baseCoinNetworkId },
        include: { coin: true },
      }),
      prisma.coinNetwork.findUnique({
        where: { id: quoteCoinNetworkId },
        include: { coin: true },
      }),
    ]);

    if (!base || !base.isActive) {
      return res.status(400).json({ error: "Invalid base coin" });
    }

    if (!quote || !quote.isActive) {
      return res.status(400).json({ error: "Invalid quote coin" });
    }

    if (base.networkId !== quote.networkId) {
      return res.status(400).json({
        error: "Base and quote must be on the same network",
      });
    }

    if (base.coinId === quote.coinId) {
      return res.status(400).json({
        error: "Base and quote cannot be the same asset",
      });
    }

    if (quote.coin.symbol !== "USDT") {
      return res.status(400).json({
        error: "Only USDT is allowed as quote currency",
      });
    }

    if (base.coin.symbol === "USDT") {
      return res.status(400).json({
        error: "USDT cannot be used as base currency",
      });
    }

    const symbol = `${base.coin.symbol}/${quote.coin.symbol}`;
    const wsSymbol = `${base.coin.symbol}${quote.coin.symbol}`.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      let pair = await tx.marketPair.findUnique({
        where: {
          baseCoinId_quoteCoinId_networkId: {
            baseCoinId: base.coinId,
            quoteCoinId: quote.coinId,
            networkId: base.networkId,
          },
        },
      });

      if (!pair) {
        pair = await tx.marketPair.create({
          data: {
            baseCoinId: base.coinId,
            quoteCoinId: quote.coinId,
            networkId: base.networkId,
            symbol,
            wsSymbol,
            isActive: true,
          },
        });
      } else if (!pair.isActive) {
        pair = await tx.marketPair.update({
          where: { id: pair.id },
          data: { isActive: true },
        });
      }

      const existingConfig = await tx.tradeConfig.findUnique({
        where: {
          marketPairId_period_direction: {
            marketPairId: pair.id,
            period,
            direction,
          },
        },
      });

      if (existingConfig) {
        throw new Error("CONFIG_ALREADY_EXISTS");
      }

      const config = await tx.tradeConfig.create({
        data: {
          marketPairId: pair.id,
          period,
          direction,
          minStake,
          maxStake,
          profitRate,
          isActive: isActive ?? true, // 👈 added
        },
      });

      return { pair, config };
    });

    return res.status(201).json({
      success: true,
      pair: result.pair,
      config: result.config,
      message: "Trading pair and config created successfully",
    });
  } catch (err: any) {
    console.error("createPair error:", err);

    if (err.message === "CONFIG_ALREADY_EXISTS") {
      return res.status(409).json({
        error: "This trading configuration already exists for the pair",
      });
    }

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Duplicate trading pair",
      });
    }

    return res.status(500).json({
      error: "Failed to create trading pair",
    });
  }
};

export const updatePair = async (req: Request, res: Response) => {
  try {
    const pairId = req.params.id;
    const { isActive } = updatePairSchema.parse(req.body);

    // 1️⃣ Ensure pair exists
    const pair = await prisma.marketPair.findUnique({
      where: { id: pairId },
    });

    if (!pair) {
      return res.status(404).json({
        success: false,
        error: "Trading pair not found",
      });
    }

    // 2️⃣ Update pair
    const updatedPair = await prisma.marketPair.update({
      where: { id: pairId },
      data: {
        isActive: isActive ?? pair.isActive,
      },
      include: {
        baseCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        quoteCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
      },
    });

    return res.json({
      success: true,
      pair: updatedPair,
    });
  } catch (err: any) {
    console.error("updatePair error", err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to update trading pair",
    });
  }
};

export const getPairs = async (req: Request, res: Response) => {
  try {
    const pairs = await prisma.marketPair.findMany({
      where: { isActive: true },
      select: {
        id: true,
        symbol: true,
        networkId: true, // ✅ added
        baseCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        quoteCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
      },
      orderBy: { symbol: "asc" },
    });

    res.json({
      success: true,
      pairs,
    });
  } catch (err) {
    console.error("getPairs error", err);
    res.status(500).json({ error: "Failed to fetch pairs" });
  }
};

export const adminGetPairs = async (req: Request, res: Response) => {
  try {
    const pairs = await prisma.marketPair.findMany({
      include: {
        network: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            icon: true,
            isActive: true,
          },
        },
        baseCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        quoteCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
      },
      orderBy: { symbol: "asc" },
    });

    res.json({
      success: true,
      pairs,
    });
  } catch (err) {
    console.error("adminGetPairs error", err);
    res.status(500).json({ error: "Failed to fetch pairs" });
  }
};

export const getPairById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    /* ===========================
       Fetch market pair + configs
    ============================ */
    const pair = await prisma.marketPair.findUnique({
      where: { id },
      include: {
        network: {
          select: { id: true, name: true },
        },
        baseCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        quoteCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        tradeConfigs: {
          where: { isActive: true },
          orderBy: { period: "asc" },
          select: {
            id: true,
            period: true,
            direction: true,
            minStake: true,
            maxStake: true,
            profitRate: true,
            isActive: true,
          },
        },
      },
    });

    if (!pair || !pair.isActive) {
      return res.status(404).json({
        success: false,
        error: "Market pair not found or inactive",
      });
    }

    /* ===========================
       Guest user
    ============================ */
    if (!userId) {
      return res.json({
        success: true,
        pair,
        wallet: {
          exists: false,
          balance: 0,
        },
      });
    }

    /* ===========================
       Fetch USDT wallet (same network)
    ============================ */
    const usdtWallet = await prisma.wallet.findFirst({
      where: {
        userId,
        coin: { symbol: "USDT" },
        networkId: pair.networkId,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    return res.json({
      success: true,
      pair,
      wallet: {
        exists: Boolean(usdtWallet),
        walletId: usdtWallet?.id ?? null,
        balance: usdtWallet?.balance ?? 0,
      },
    });
  } catch (err) {
    console.error("getPairById error", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch market pair",
    });
  }
};

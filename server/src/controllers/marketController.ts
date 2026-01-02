import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import { AuthRequest } from "../middlewares/authMiddleware";

export const createPairSchema = z.object({
  baseCoinNetworkId: z.string().uuid(),
  quoteCoinNetworkId: z.string().uuid(),
  isActive: z.boolean().optional(),
});

const updatePairSchema = z.object({
  isActive: z.boolean().optional(),
});
export const createPair = async (req: Request, res: Response) => {
  try {
    const { baseCoinNetworkId, quoteCoinNetworkId } =
      createPairSchema.parse(req.body);

    /* ===========================
       Load coin-networks
    ============================ */
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

    /* ===========================
       Enforce same network
    ============================ */
    if (base.networkId !== quote.networkId) {
      return res.status(400).json({
        error: "Base and quote must be on the same network",
      });
    }

    /* ===========================
       Enforce market rules
    ============================ */
    if (base.coinId === quote.coinId) {
      return res.status(400).json({
        error: "Base and quote cannot be the same asset",
      });
    }

    // 🔥 CRITICAL RULE
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

    /* ===========================
       Build symbols
    ============================ */
    const symbol = `${base.coin.symbol}/${quote.coin.symbol}`;
    const wsSymbol = `${base.coin.symbol}${quote.coin.symbol}`.toLowerCase();

    /* ===========================
       DUPLICATE CHECK (EXACT)
    ============================ */
    const existingPair = await prisma.marketPair.findUnique({
      where: {
        baseCoinId_quoteCoinId_networkId: {
          baseCoinId: base.coinId,
          quoteCoinId: quote.coinId,
          networkId: base.networkId,
        },
      },
    });

    if (existingPair) {
      const updated = await prisma.marketPair.update({
        where: { id: existingPair.id },
        data: { isActive: true },
      });

      return res.status(200).json({
        success: true,
        pair: updated,
        message: "Pair already existed and was reactivated",
      });
    }

    /* ===========================
       Create pair
    ============================ */
    const pair = await prisma.marketPair.create({
      data: {
        baseCoinId: base.coinId,
        quoteCoinId: quote.coinId,
        networkId: base.networkId,
        symbol,
        wsSymbol,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      pair,
    });
  } catch (err: any) {
    console.error("createPair error:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Trading pair already exists",
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
console.log("Fetching pair by ID:", id, "for user:", userId);
    /* ===========================
       Fetch market pair
    ============================ */
    const pair = await prisma.marketPair.findUnique({
      where: { id },
      include: {
        // network: {
        //   select: { id: true, name: true },
        // },
        baseCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
        quoteCoin: {
          select: { id: true, symbol: true, name: true, iconUrl: true },
        },
      },
    });

    if (!pair) {
      return res.status(404).json({
        success: false,
        error: "Market pair not found",
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
       Fetch BASE COIN wallet
       (coinId + networkId)
    ============================ */
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        coinId: pair.baseCoinId,
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
        exists: Boolean(wallet),
        walletId: wallet?.id ?? null,
        balance: wallet?.balance ?? 0,
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

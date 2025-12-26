import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { z } from "zod";
import {
  fetchPrices,
  getMarketPriceForCoin,
} from "../services/marketPriceService";
import { enforceFinancialAccess } from "../utils/accessGuard";

export const placeOrderSchema = z.object({
  coinId: z.string().uuid(),
  networkId: z.string().uuid(), // REQUIRED
  type: z.enum(["BUY", "SELL"]),
  amount: z.number().positive(),
  stake: z.number().positive().optional(),
  entryPrice: z.number().positive(), // ✅ FROM FRONTEND
});

export const TRADE_PERIODS = {
  S30: { seconds: 30, profitRate: 0.8 },
  M1: { seconds: 60, profitRate: 0.9 },
  M5: { seconds: 300, profitRate: 1.2 },
  M15: { seconds: 900, profitRate: 1.5 },
} as const;

export const placeTradeSchema = z.object({
  coinId: z.string().uuid("Invalid coinId"),
  networkId: z.string().uuid("Invalid networkId"),

  direction: z.enum(["BULLISH", "BEARISH"], {
    required_error: "Trade direction is required",
  }),

  period: z.enum(["S30", "M1", "M5", "M15"], {
    required_error: "Trade period is required",
  }),

  stake: z
    .number()
    .positive("Stake must be greater than 0")
    .max(1_000_000, "Stake too large"),
  entryPrice: z.number().positive(),
});

export const getMarketPrices = async (req: Request, res: Response) => {
  try {
    const prices = await fetchPrices();
    res.json(prices);
  } catch (error) {
    console.error("getMarketPrices error:", error);
    res.status(500).json({ error: "Failed to fetch market prices" });
  }
};
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const {
      coinId,
      networkId,
      direction,
      period,
      stake,
      entryPrice, // 👈 price passed from frontend
    } = placeTradeSchema.parse(req.body);

    if (stake <= 0) {
      return res.status(400).json({ error: "Invalid stake amount" });
    }

    const tradeConfig = TRADE_PERIODS[period];
    if (!tradeConfig) {
      return res.status(400).json({ error: "Invalid trade period" });
    }

    const expiresAt = new Date(
      Date.now() + tradeConfig.seconds * 1000
    );

    const order = await prisma.$transaction(async (tx) => {
      /* ===========================
         Fetch wallet (LOCKED)
      ============================ */
      const wallet = await tx.wallet.findUnique({
        where: {
          userId_coinId_networkId: {
            userId,
            coinId,
            networkId,
          },
        },
      });

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      /* ===========================
         ❌ BLOCK INSUFFICIENT FUNDS
      ============================ */
      if (wallet.balance < stake) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      /* ===========================
         Deduct balance
      ============================ */
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: stake,
          },
        },
      });

      /* ===========================
         Create order
      ============================ */
      return tx.order.create({
        data: {
          userId,
          coinId,
          networkId,
          direction,
          period,
          stake,
          entryPrice,
          profitRate: tradeConfig.profitRate,
          expiresAt,
          status: "PENDING",
        },
      });
    });

    return res.json({
      success: true,
      order,
    });
  } catch (err: any) {
    if (err.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        error: "Insufficient wallet balance",
      });
    }

    if (err.message === "WALLET_NOT_FOUND") {
      return res.status(400).json({
        error: "Wallet not found for this coin and network",
      });
    }

    console.error("placeOrder error", err);
    return res.status(500).json({
      error: "Trade placement failed",
    });
  }
};


// const settleTrade = async (orderId: string) => {
//   const order = await prisma.order.findUnique({
//     where: { id: orderId },
//   });

//   if (!order || order.status !== "PENDING") return;

//   const market = await getMarketPriceForCoin(order.coinId);
//   const exitPrice = market.price;

//   const won =
//     order.direction === "BULLISH"
//       ? exitPrice > order.entryPrice
//       : exitPrice < order.entryPrice;

//   await prisma.$transaction(async (tx) => {
//     if (won) {
//       const payout = order.stake * (1 + order.profitRate);

//       await tx.wallet.update({
//         where: {
//           userId_coinId_networkId: {
//             userId: order.userId,
//             coinId: USDT_ID,
//             networkId: order.networkId,
//           },
//         },
//         data: { balance: { increment: payout } },
//       });
//     }

//     await tx.order.update({
//       where: { id: order.id },
//       data: {
//         status: "SETTLED",
//         result: won ? "WIN" : "LOSS",
//         settledAt: new Date(),
//       },
//     });
//   });
// };

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { coin: true },
    });
    res.json(orders);
  } catch (error) {
    console.error("getUserOrders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

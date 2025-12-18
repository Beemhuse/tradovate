import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { z } from 'zod';
import { fetchPrices, getMarketPriceForCoin } from '../services/marketPriceService';

const placeOrderSchema = z.object({
  coinId: z.string(),
  type: z.enum(['BUY', 'SELL']),
  amount: z.number().positive(),
  price: z.number().positive(),
});


export const getMarketPrices = async (req: Request, res: Response) => {
  try {
  const prices = await fetchPrices();
    res.json(prices);
  } catch (error) {
    console.error('getMarketPrices error:', error);
    res.status(500).json({ error: 'Failed to fetch market prices' });
  }
};

export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { coinId, type, amount, price } = placeOrderSchema.parse(req.body);

    const coin = await prisma.coin.findUnique({ where: { id: coinId } });
    if (!coin || !coin.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive coin' });
    }

    const market = await getMarketPriceForCoin(coinId);
    if (!market) {
      return res
        .status(400)
        .json({ error: 'Market price not available for this coin' });
    }

    const finalPrice = price ?? market.price;
    const totalValue = finalPrice * amount;

    const usdtCoin = await prisma.coin.findFirst({
      where: { symbol: 'USDT', isActive: true },
    });
    if (!usdtCoin) {
      return res.status(500).json({ error: 'USDT coin is not configured' });
    }

    if (type === 'BUY') {
      const usdtWallet = await prisma.wallet.findUnique({
        where: {
          userId_coinId: {
            userId,
            coinId: usdtCoin.id,
          },
        },
      });
      const usdtBalance = usdtWallet?.balance ?? 0;
      if (usdtBalance < totalValue) {
        return res
          .status(400)
          .json({ error: 'Insufficient USDT balance for BUY order' });
      }
    } else {
      const coinWallet = await prisma.wallet.findUnique({
        where: { userId_coinId: { userId, coinId } },
      });
      const coinBalance = coinWallet?.balance ?? 0;
      if (coinBalance < amount) {
        return res
          .status(400)
          .json({ error: `Insufficient ${coin.symbol} balance for SELL order` });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        coinId,
        type,
        amount,
        price: finalPrice,
        status: 'PENDING',
      },
    });

    res.json(order);
  } catch (error) {
    console.error('placeOrder error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to place order' });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { coin: true },
    });
    res.json(orders);
  } catch (error) {
    console.error('getUserOrders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import dayjs from "dayjs";
import {
  TransactionType,
  TransactionStatus,
  KycStatus,
} from "@prisma/client";


export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    /** 📊 METRICS */
    const [
      totalUsers,
      activeCoins,
      pendingKyc,
      tradingVolumeAgg,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.coin.count({
        where: { isActive: true },
      }),

      prisma.kyc.count({
        where: { status: KycStatus.PENDING },
      }),

      prisma.transaction.aggregate({
        where: {
          type: {
            in: [TransactionType.BUY, TransactionType.SELL],
          },
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),
    ]);

    const tradingVolume = tradingVolumeAgg?._sum?.amount ?? 0;

    /** 🕒 RECENT USERS */
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        email: true,
        createdAt: true,
      },
    });

    /** 🕒 RECENT KYC */
    const recentKyc = await prisma.kyc.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    /** 🕒 RECENT TRANSACTIONS */
    const recentTx = await prisma.transaction.findMany({
      where: {
        type: {
          in: [
            TransactionType.WITHDRAW,
            TransactionType.BANK_WITHDRAW,
            TransactionType.DEPOSIT,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    /** 🧾 NORMALIZED ACTIVITY FEED */
    const activity = [
      ...recentUsers.map((u) => ({
        type: "New user registered",
        description: u.email ?? "Unknown user",
        timestamp: dayjs(u.createdAt).valueOf(),
      })),

      ...recentKyc.map((k) => ({
        type: "KYC submitted",
        description: k.user?.email ?? "Unknown user",
        timestamp: dayjs(k.createdAt).valueOf(),
      })),

      ...recentTx.map((t) => ({
        type:
          t.type === TransactionType.DEPOSIT
            ? "New deposit"
            : "Withdrawal request",
        description: t.user?.email ?? "Unknown user",
        timestamp: dayjs(t.createdAt).valueOf(),
      })),
    ]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6)
      .map(({ timestamp, ...rest }) => ({
        ...rest
        // time: dayjs(timestamp).fromNow(),
      }));

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        activeCoins,
        pendingKyc,
        tradingVolume,
      },
      activity,
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Failed to load dashboard metrics",
    });
  }
};
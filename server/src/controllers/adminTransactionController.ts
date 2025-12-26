// src/controllers/adminTransactionController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";

/**
 * Expected request body for status update:
 * { action: "approve"|"reject"|"hold", note?: string }
 */
const updateActionSchema = z.object({
  action: z.enum(["approve", "reject", "hold"]),
  note: z.string().optional().nullable(),
});

/**
 * GET /admin/transactions
 * List transactions (admins only). Supports query filters: status, type, userId, coinId
 */
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { status, type, userId, coinId } = req.query;
    const where: any = {};

    if (type) where.type = String(type).toUpperCase();
    if (userId) where.userId = String(userId);

    // coinId filtering through wallet relation
    if (coinId) {
      where.wallet = { is: { coinId: String(coinId) } };
    }

    // status map (frontend uses friendly names in some places; callers may pass enum strings)
    if (status && String(status) !== "all") {
      const s = String(status);
      if (["PENDING", "COMPLETED", "FAILED", "CANCELLED"].includes(s.toUpperCase())) {
        where.status = s.toUpperCase();
      } else {
        // map friendly values to enums
        if (s === "pending") where.status = "PENDING";
        else if (s === "approved") where.status = "COMPLETED";
        else if (s === "rejected") where.status = "CANCELLED";
        else if (s === "failed") where.status = "FAILED";
      }
    }

    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, /* name if available */ } },
        wallet: {
          include: {
            coin: true,
            network: true,
          },
        },
      },
    });

    // map to simpler frontend shape optionally
    const payload = txs.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      createdAt: tx.createdAt,
      user: tx.user,
      walletId: tx.walletId,
      coin: tx.wallet?.coin ? { id: tx.wallet.coin.id, symbol: tx.wallet.coin.symbol, name: tx.wallet.coin.name } : null,
      network: tx.wallet?.network ? { id: tx.wallet.network.id, name: tx.wallet.network.name } : null,
      raw: tx,
      adminAction: tx.adminAction ?? null,
      adminId: tx.adminId ?? null,
      adminMessage: tx.adminMessage ?? null,
    }));

    return res.json({ success: true, count: payload.length, transactions: payload });
  } catch (err) {
    console.error("getAllTransactions error", err);
    return res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
};

/**
 * PATCH /admin/transactions/:id/status
 * Body: { action: "approve"|"reject"|"hold", note?: string }
 *
 * This endpoint records adminAction/adminId/adminMessage in the transaction record.
 */
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const paramsParse = updateActionSchema.safeParse(req.body);
    if (!paramsParse.success) {
      return res.status(400).json({ success: false, error: "Invalid payload", details: paramsParse.error.errors });
    }
    const { action, note } = paramsParse.data;

    const txId = req.params.id;
    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { wallet: { include: { coin: true, network: true } }, user: true },
    });

    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    // adminId from authenticated user; assume your auth middleware attaches user to req.user
    const adminId = (req as any).user?.userId ?? null;

    // Prevent approving/rejecting non-pending transactions (hold is allowed)
    if (tx.status !== "PENDING" && action !== "hold") {
      return res.status(400).json({
        success: false,
        error: `Transaction already ${tx.status}`,
        frontendMessage: `This transaction is already ${tx.status}.`,
      });
    }

    let frontendMessage = "";
    let newStatus: typeof tx.status = tx.status;

    if (action === "approve") {
      // Approve flow
      if (tx.type === "DEPOSIT") {
        if (!tx.walletId) {
          return res.status(400).json({
            success: false,
            error: "Missing wallet for deposit transaction",
            frontendMessage: "Cannot credit wallet because wallet information is missing.",
          });
        }

        // credit wallet balance (amount). Make sure amount is number-like.
        await prisma.wallet.update({
          where: { id: tx.walletId },
          data: { balance: { increment: Number(tx.amount) } },
        });

        frontendMessage = `Deposit of ${tx.amount} ${tx.wallet?.coin?.symbol ?? ""} approved and credited to wallet.`;
      } else if (tx.type === "WITHDRAW") {
        frontendMessage = `Withdrawal of ${tx.amount} ${tx.wallet?.coin?.symbol ?? ""} approved. Please process on-chain as needed.`;
      } else if (tx.type === "BANK_WITHDRAW") {
        frontendMessage = `Bank withdrawal of ${tx.amount} approved. Please transfer the funds to the user's bank account (Account: ${tx.accountNumber ?? "N/A"}, Bank: ${tx.bankName ?? "N/A"}).`;
      } else {
        frontendMessage = `Transaction approved.`;
      }
      newStatus = "COMPLETED";
    } else if (action === "reject") {
      // reject flow
      newStatus = "CANCELLED";
      frontendMessage = `Transaction rejected.`;
    } else if (action === "hold") {
      // hold flow — keep status PENDING, but record adminAction=HOLD
      // We'll update adminAction/adminMessage below and return early after update
      const updatedHold = await prisma.transaction.update({
        where: { id: txId },
        data: {
          adminId,
          adminAction: "HOLD",
          adminMessage: note ?? `Placed on hold by admin ${adminId ?? "unknown"}`,
        },
      });

      return res.json({
        success: true,
        message: "Transaction placed on hold",
        frontendMessage: updatedHold.adminMessage,
        transaction: updatedHold,
      });
    }

    // Update transaction to final state (approve or reject)
    const updated = await prisma.transaction.update({
      where: { id: txId },
      data: {
        status: newStatus,
        adminId,
        adminAction: action === "approve" ? "APPROVE" : "REJECT",
        adminMessage: note ?? frontendMessage,
      },
    });

    return res.json({
      success: true,
      message: "Transaction updated",
      frontendMessage: note ?? frontendMessage,
      transaction: updated,
    });
  } catch (err: any) {
    console.error("updateTransactionStatus error", err);
    return res.status(500).json({
      success: false,
      error: "Failed to update transaction",
      frontendMessage: "An unexpected error occurred while updating the transaction.",
      details: err?.message,
    });
  }
};

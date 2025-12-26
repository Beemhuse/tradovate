import { getUserTransactionById, getUserTransactions } from "../controllers/userTransactionsController";
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

/**
 * User transactions
 */
router.get("/", authenticateToken, getUserTransactions);
router.get("/:id", authenticateToken, getUserTransactionById);

export default router;

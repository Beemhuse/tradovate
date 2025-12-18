import { Router } from "express";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";
import {
  createCoin,
  updateCoin,
  deleteCoin,
  createNetwork,
  linkCoinToNetwork,
  getAllUsersWithWallets,
  updateUserWallet,
} from "../controllers/adminController";

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireRole("ADMIN"));
router.post("/coins", createCoin);
/**
 * @swagger
 * /admin/coins/{id}:
 *   put:
 *     summary: Update a coin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               name:
 *                 type: string
 *               iconUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coin updated
 */
router.put("/coins/:id", updateCoin);

/**
 * @swagger
 * /admin/coins/{id}:
 *   delete:
 *     summary: Delete a coin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coin deleted
 */
router.delete("/coins/:id", deleteCoin);

/**
 * @swagger
 * /admin/networks:
 *   post:
 *     summary: Create a new network
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Network created
 */
router.post("/networks", createNetwork);

/**
 * @swagger
 * /admin/coin-network:
 *   post:
 *     summary: Link a coin to a network
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coinId:
 *                 type: string
 *               networkId:
 *                 type: string
 *               contractAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Linked successfully
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with wallets
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with details
 */
router.get("/users", getAllUsersWithWallets);

/**
 * @swagger
 * /admin/wallet/update:
 *   post:
 *     summary: Update user wallet balance directly
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletId:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Wallet updated
 */
router.post("/wallet/update", updateUserWallet);

router.post("/coin-network", linkCoinToNetwork);

export default router;

import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { getCoins } from '../controllers/coinController';
import { getAssets, createWallet, requestDeposit, requestWithdraw, getTransactions } from '../controllers/walletController';
import { getMarketPrices, placeOrder, getUserOrders } from '../controllers/orderController';

const router = Router();

/**
 * @swagger
 * /market/coins:
 *   get:
 *     summary: List all active coins
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: List of coins
 */
router.get('/coins', getCoins); // Public
/**
 * @swagger
 * /market/prices:
 *   get:
 *     summary: Get current market prices
 *     tags: [Market]
 *     responses:
 *       200:
 *         description: Live prices
 */
router.get('/prices', getMarketPrices); // Public

// Wallet Routes
router.use(authenticateToken);

/**
 * @swagger
 * /market/assets:
 *   get:
 *     summary: Get user wallets
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User assets
 */
router.get('/assets', getAssets);

/**
 * @swagger
 * /market/wallet:
 *   post:
 *     summary: Create/Get wallet for a coin
 *     tags: [Wallet]
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
 *     responses:
 *       200:
 *         description: Wallet details
 */
router.post('/wallet', createWallet);

/**
 * @swagger
 * /market/deposit:
 *   post:
 *     summary: Request a deposit
 *     tags: [Wallet]
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
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deposit requested
 */
router.post('/deposit', requestDeposit);

/**
 * @swagger
 * /market/withdraw:
 *   post:
 *     summary: Request a withdrawal
 *     tags: [Wallet]
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
 *               amount:
 *                 type: number
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Withdrawal requested
 */
router.post('/withdraw', requestWithdraw);

/**
 * @swagger
 * /market/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transaction history
 */
router.get('/transactions', getTransactions);

/**
 * @swagger
 * /market/order:
 *   post:
 *     summary: Place a new order
 *     tags: [Market]
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
 *               type:
 *                 type: string
 *                 enum: [BUY, SELL]
 *               amount:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order placed
 */
router.post('/order', placeOrder);

/**
 * @swagger
 * /market/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Market]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders
 */
router.get('/orders', getUserOrders);

export default router;

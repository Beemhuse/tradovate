import express from "express";
import { authenticateToken, requireRole } from './../middlewares/authMiddleware';
import { createNetwork, deactivateNetwork, deleteNetwork, getNetworkById, updateNetwork } from "../controllers/networkController";
import { getAllNetworks } from "../controllers/adminController";

const router = express.Router();
router.use(authenticateToken, requireRole("ADMIN"));

// =============== NETWORK MANAGEMENT ROUTES ===============

/**
 * @swagger
 * /admin/networks:
 *   post:
 *     summary: Create a new blockchain network
 *     description: Add a new blockchain network to the platform (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Ethereum Mainnet"
 *                 description: Network name
 *               type:
 *                 type: string
 *                 example: "ERC20"
 *                 description: Network type/token standard
 *               chainId:
 *                 type: string
 *                 example: "1"
 *                 description: Blockchain chain ID
 *               rpcUrl:
 *                 type: string
 *                 example: "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
 *                 description: RPC endpoint URL
 *               explorerUrl:
 *                 type: string
 *                 example: "https://etherscan.io"
 *                 description: Block explorer URL
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *                 description: Whether the network is active
 *     responses:
 *       201:
 *         description: Network created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network created successfully"
 *                 network:
 *                   $ref: '#/components/schemas/Network'
 *       400:
 *         description: Validation error or invalid data
 *       409:
 *         description: Network with same name or type already exists
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.post("/networks", createNetwork);

/**
 * @swagger
 * /admin/networks:
 *   get:
 *     summary: Get all networks
 *     description: Retrieve all blockchain networks (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include inactive networks
 *         example: "false"
 *     responses:
 *       200:
 *         description: List of networks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 networks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Network'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       500:
 *         description: Internal server error
 */
router.get("/networks", getAllNetworks);

/**
 * @swagger
 * /admin/networks/{id}:
 *   get:
 *     summary: Get network by ID
 *     description: Retrieve a specific network by its ID (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Network ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Network retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 network:
 *                   $ref: '#/components/schemas/Network'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Network not found
 *       500:
 *         description: Internal server error
 */
router.get("/networks/:id", getNetworkById);

/**
 * @swagger
 * /admin/networks/{id}:
 *   put:
 *     summary: Update network
 *     description: Update an existing blockchain network (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Network ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Network Name"
 *               type:
 *                 type: string
 *                 example: "BEP20"
 *               chainId:
 *                 type: string
 *                 example: "56"
 *               rpcUrl:
 *                 type: string
 *                 example: "https://bsc-dataseed.binance.org/"
 *               explorerUrl:
 *                 type: string
 *                 example: "https://bscscan.com"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Network updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network updated successfully"
 *                 network:
 *                   $ref: '#/components/schemas/Network'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Network not found
 *       500:
 *         description: Internal server error
 */
router.put("/networks/:id", updateNetwork);

/**
 * @swagger
 * /admin/networks/{id}/deactivate:
 *   delete:
 *     summary: Deactivate network
 *     description: Deactivate a network (soft delete) - keeps data but makes it inactive (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Network ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Network deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network deactivated successfully"
 *                 details:
 *                   type: object
 *                   properties:
 *                     network:
 *                       type: string
 *                       example: "Ethereum Mainnet"
 *                     coinsAffected:
 *                       type: integer
 *                       example: 3
 *                     walletsAffected:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Network not found
 *       500:
 *         description: Internal server error
 */
router.delete("/networks/:id/deactivate", deactivateNetwork);

/**
 * @swagger
 * /admin/networks/{id}:
 *   delete:
 *     summary: Delete network permanently
 *     description: Permanently delete a network and all its associations (Admin only)
 *     tags: [Admin - Networks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Network ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: force
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Force delete even if network has active references
 *         example: "false"
 *     responses:
 *       200:
 *         description: Network deleted permanently
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Network deleted permanently"
 *                 details:
 *                   type: object
 *                   properties:
 *                     network:
 *                       type: string
 *                       example: "Ethereum Mainnet"
 *                     forceDeleted:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Cannot delete network with active references (unless force=true)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Network not found
 *       500:
 *         description: Internal server error
 */
router.delete("/networks/:id", deleteNetwork);

export default router;
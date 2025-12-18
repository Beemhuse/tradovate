import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import QRCode from "qrcode";

export const getCoins = async (req: Request, res: Response) => {
  try {
    const coins = await prisma.coin.findMany({
      where: { isActive: true },
      include: {
        networks: {
          include: { network: true },
        },
      },
    });

    // Generate QR codes for contract addresses
    const coinsWithQr = await Promise.all(
      coins.map(async (coin) => {
        const networksWithQr = await Promise.all(
          coin.networks.map(async (cn) => {
            let qrCode = "";
            if (cn.contractAddress) {
              try {
                qrCode = await QRCode.toDataURL(cn.contractAddress);
              } catch (e) {
                console.error("QR Gen Error", e);
              }
            }
            return { ...cn, qrCode };
          })
        );
        return { ...coin, networks: networksWithQr };
      })
    );

    res.json(coinsWithQr);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coins" });
  }
};

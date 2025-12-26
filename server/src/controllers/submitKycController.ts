// src/controllers/submitKycController.ts
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import path from "path";
import { AuthRequest } from "middlewares/authMiddleware";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL ?? "https://api.tradovate.com";
const bodySchema = z.object({
  status: z.enum(["approved", "rejected", "pending"]).transform((s) =>
    s.toUpperCase()
  ), // accepts lowercase on input, transforms to UPPERCASE for DB
  reason: z.string().optional().nullable(),
});
// Define a Request type that includes multer files
type MulterFiles = {
  front?: Express.Multer.File[];
  back?: Express.Multer.File[];
};

type MulterRequest = Request & {
  files?: MulterFiles;
  user?: { id: string; role?: string }; // depends on your auth middleware
};

// schema for optional body fields
const submitKycSchema = z.object({
  idType: z.string().optional(),
  country: z.string().optional(),
});



export const getMyKyc = async (req: MulterRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const kyc = await prisma.kyc.findUnique({ where: { userId } });
    if (!kyc) return res.status(404).json({ error: "KYC not found" });
    return res.json(kyc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch KYC" });
  }
};

// Admin handlers (approve/reject/list)

export const adminListKyc = async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.kyc.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    const mapped = records.map((r) => ({
      ...r,
      frontImage: r.frontImage ? `${BASE_URL}${r.frontImage}` : null,
      backImage:  r.backImage  ? `${BASE_URL}${r.backImage}`  : null,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      user: r.user ?? null,
    }));

    return res.json({ success: true, count: mapped.length, kyc: mapped });
  } catch (err) {
    console.error("getAllKyc error", err);
    return res.status(500).json({ success: false, error: "Failed to fetch KYC records" });
  }
};

export const updateKycStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const adminId = req.user?.userId ?? null;

    // Validate body
    const parsed = bodySchema.parse(req.body);
    const statusUpper = parsed.status as "APPROVED" | "REJECTED" | "PENDING";
    const reason = parsed.reason ?? undefined;

    // Ensure KYC exists
    const existing = await prisma.kyc.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "KYC record not found" });
    }

    // Determine user's kycStatus update value
    let userKycStatus: "APPROVED" | "REJECTED" | "PENDING" = "PENDING";
    if (statusUpper === "APPROVED") userKycStatus = "APPROVED";
    else if (statusUpper === "REJECTED") userKycStatus = "REJECTED";
    else userKycStatus = "PENDING";

    // Perform atomic updates: update Kyc and user's kycStatus
    const [updatedKyc] = await prisma.$transaction([
      prisma.kyc.update({
        where: { id },
        data: {
          status: statusUpper,
          reason: statusUpper === "REJECTED" ? reason : null,
          reviewedBy: adminId ?? undefined,
          reviewedAt: new Date(),
        },
        include: { user: { select: { id: true, email: true } } },
      }),
      prisma.user.update({
        where: { id: existing.userId },
        data: {
          kycStatus: userKycStatus,
        },
      }),
    ]);

    // Compose absolute image URLs for response (do not overwrite DB)
    const frontImageUrl = updatedKyc.frontImage ? `${BASE_URL}${updatedKyc.frontImage}` : null;
    const backImageUrl = updatedKyc.backImage ? `${BASE_URL}${updatedKyc.backImage}` : null;

    const frontendMessage =
      statusUpper === "APPROVED"
        ? "KYC approved successfully"
        : statusUpper === "REJECTED"
        ? "KYC rejected"
        : "KYC status updated";

    return res.json({
      success: true,
      frontendMessage,
      kyc: {
        ...updatedKyc,
        frontImage: frontImageUrl,
        backImage: backImageUrl,
      },
    });
  } catch (err: any) {
    // Zod validation error
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Invalid input", details: err.errors });
    }

    console.error("updateKycStatus error", err);
    return res.status(500).json({ success: false, error: "Failed to update KYC" });
  }
};


export const submitKyc = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.front?.[0] || !files?.back?.[0]) {
      return res.status(400).json({
        success: false,
        error: "Front and back images are required",
      });
    }

    // Fetch existing KYC + user's current KYC status
    const existingKyc = await prisma.kyc.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    // --- CASE 1: KYC Already Exists & Is NOT Rejected ---
    if (existingKyc && user?.kycStatus !== 'PENDING' && existingKyc?.status !== 'REJECTED') {
      return res.status(409).json({
        success: false,
        error: "KYC already submitted",
        currentStatus: existingKyc.status,
      });
    }

    // --- CASE 2: KYC was REJECTED -> Allow re-submission ---
    if (existingKyc && existingKyc?.status === "REJECTED") {
      await prisma.kyc.delete({ where: { userId } });

      // Reset user status so admin can review again
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: "PENDING" },
      });
    }

    // --- CREATE NEW KYC RECORD ---
    const created = await prisma.kyc.create({
      data: {
        userId,
        frontImage: `/uploads/kyc/${userId}/${files.front[0].filename}`,
        backImage: `/uploads/kyc/${userId}/${files.back[0].filename}`,
        status: "PENDING",
      },
      include: {
        user: {
          select: { id: true, email: true, kycStatus: true },
        },
      },
    });

    // Ensure the user status is updated
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    });

    return res.status(201).json({
      success: true,
      message: "KYC submitted successfully",
      kyc: {
        ...created,
        frontImage: `${BASE_URL}${created.frontImage}`,
        backImage: `${BASE_URL}${created.backImage}`,
      },
    });
  } catch (error) {
    console.error("Submit KYC error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to submit KYC",
    });
  }
};
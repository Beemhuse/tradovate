import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { sendOtpEmail } from "../utils/email";
import { generateTokens } from "../utils/token";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "brightawah94@gmail.com";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(6),
});

// Helper: Generate & Send OTP
const generateAndSendOtp = async (email: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.otp.deleteMany({ where: { email } });
  await prisma.otp.create({ data: { email, code, expiresAt } });

  return sendOtpEmail(email, code);
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === ADMIN_EMAIL ? "ADMIN" : "USER";

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        isVerified: false,
      },
    });

    const sent = await generateAndSendOtp(email);
    if (!sent)
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });

    res.json({
      message: "User created. Please check email for OTP to verify.",
    });
  } catch (error: any) {
    console.error("Signup error:", error); // 👈 add this

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    return res
      .status(500)
      .json({ error: "Signup failed", detail: error?.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, code } = verifyEmailSchema.parse(req.body);

    const validOtp = await prisma.otp.findFirst({
      where: { email, code, expiresAt: { gt: new Date() } },
    });
    if (!validOtp)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    await prisma.otp.delete({ where: { id: validOtp.id } });

    // Auto-login? Or ask to login.
    res.json({ message: "Email verified. You can now login." });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: "Verification failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password)
      return res.status(400).json({ error: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(400).json({ error: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ error: "Email not verified" });

    // Admin restriction: if trying to login as admin BUT email doesn't match env, force user role?
    // Or schema handles role. The seed/signup logic ensures correct role.
    // We can enforce stricter check here if needed.
    if (user.role === "ADMIN" && email !== ADMIN_EMAIL) {
      // This case theoretically shouldn't happen if we only grant ADMIN to that email on signup.
      // But strict check:
      return res.status(403).json({ error: "Unauthorized Admin Access" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: "Login failed" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await generateAndSendOtp(email);
    res.json({ message: "OTP sent for password reset" });
  } catch (error) {
    res.status(500).json({ error: "Request failed" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = resetPasswordSchema.parse(req.body);

    const validOtp = await prisma.otp.findFirst({
      where: { email, code, expiresAt: { gt: new Date() } },
    });
    if (!validOtp)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.otp.delete({ where: { id: validOtp.id } });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: "Reset failed" });
  }
};

// Keep requestOtp for backward compatibility if needed, or remove.
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body); // Reuse simple email schema

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await generateAndSendOtp(email);
    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.errors });
    res.status(500).json({ error: "Resend OTP failed" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(200).json({ message: "Logged out" });

    // Verify token signature and get expiration
    // We use jwt.verify (not verifyToken util) to ensure we get the exp claim and catch invalid signatures
    const secret = process.env.JWT_SECRET || "default_secret";

    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);

        // Check if already blacklisted to avoid unique constraint error
        const exists = await prisma.blacklistedToken.findUnique({
          where: { token },
        });
        if (!exists) {
          await prisma.blacklistedToken.create({
            data: { token, expiresAt },
          });
        }
      }
    } catch (err) {
      // Token invalid or expired. If expired, it's effectively logged out.
      // If invalid signature, we ignore it.
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

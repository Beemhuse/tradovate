/**
 * Authentication Types
 * Type definitions for authentication and user management
 */

// User roles enum matching backend
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth response from login/signup
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Signup request
export interface SignupRequest {
  email: string;
  password: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Email verification request
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

// Resend OTP request
export interface ResendOtpRequest {
  email: string;
}

// Auth state in context
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  adminSignup: (email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

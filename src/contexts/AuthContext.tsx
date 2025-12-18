import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  setAuthToken,
  setAuthUser,
  clearAuthToken,
  getAuthToken,
  getStoredUser,
} from "@/config/config";
import { toast } from "@/components/ui/use-toast";
import {
  User,
  UserRole,
  AuthResponse,
  AuthContextType,
  SignupRequest,
  LoginRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendOtpRequest,
} from "@/types/auth-types";
import { useCreateData } from "@/hooks/use-api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize mutation hooks for all auth operations
  const loginMutation = useCreateData<AuthResponse, LoginRequest>(
    "/auth/login",
    ["auth", "login"]
  );

  const signupMutation = useCreateData<void, SignupRequest>(
    "/auth/admin/signup",
    ["auth", "signup"]
  );

  const verifyEmailMutation = useCreateData<void, VerifyEmailRequest>(
    "/auth/verify-email",
    ["auth", "verify-email"]
  );

  const forgotPasswordMutation = useCreateData<void, ForgotPasswordRequest>(
    "/auth/forgot-password",
    ["auth", "forgot-password"]
  );

  const resetPasswordMutation = useCreateData<void, ResetPasswordRequest>(
    "/auth/reset-password",
    ["auth", "reset-password"]
  );

  const resendOtpMutation = useCreateData<void, ResendOtpRequest>(
    "/auth/resend-otp",
    ["auth", "resend-otp"]
  );

  const logoutMutation = useCreateData<void, {}>("/auth/logout", [
    "auth",
    "logout",
  ]);

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login (admin only)
  const login = async (email: string, password: string) => {
    try {
      const data: LoginRequest = { email, password };
      const response = await loginMutation.mutateAsync(data);

      // Verify user is admin
      if (response.user.role !== UserRole.ADMIN) {
        throw new Error("Access denied. Admin credentials required.");
      }

      // Store tokens and user
      setAuthToken(response.accessToken);
      setAuthUser(response.user);
      setUser(response.user);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Signup (admin only - uses admin/signup endpoint)
  const signup = async (email: string, password: string) => {
    try {
      const data: SignupRequest = { email, password };
      await signupMutation.mutateAsync(data);

      toast({
        title: "Success",
        description:
          "Admin account created! Please check your email for verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Admin Signup (alias for signup for backward compatibility)
  const adminSignup = async (email: string, password: string) => {
    return signup(email, password);
  };

  // Verify Email
  const verifyEmail = async (email: string, code: string) => {
    try {
      const data: VerifyEmailRequest = { email, code };
      await verifyEmailMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Email verified successfully! You can now login.",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    try {
      const data: ForgotPasswordRequest = { email };
      await forgotPasswordMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Password reset code sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send reset code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Reset Password
  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    try {
      const data: ResetPasswordRequest = { email, code, newPassword };
      await resetPasswordMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Password reset successfully! You can now login.",
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Resend OTP
  const resendOtp = async (email: string) => {
    try {
      const data: ResendOtpRequest = { email };
      await resendOtpMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Verification code resent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend code",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        // Call backend logout to blacklist token
        await logoutMutation.mutateAsync({});
      }
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error("Logout error:", error);
    } finally {
      // Clear local state and cookies
      clearAuthToken();
      setUser(null);

      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        signup,
        adminSignup,
        verifyEmail,
        forgotPassword,
        resetPassword,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

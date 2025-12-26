import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PasswordValidator, { isPasswordValid } from "@/components/PasswordValidator";
import TradovateLogo from "@/components/TradovateLogo";
import { useCreateData } from "@/hooks/use-api";
import { AUTH } from "@/hooks/apiEndpoint";
import { CircleArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const { toast } = useToast();

  const navigate = useNavigate();

  const { mutate, isPending } = useCreateData(AUTH.FORGOT_PASSWORD, ["forget password"])
  const { mutate: resetPasswordMutation, isPending: resetPasswordPending } = useCreateData(AUTH.RESET_PASSWORD, ["reset password"])

  // verify email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!email || email === "") {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    mutate({email},
      {
        onSuccess: () => {
          toast({
            title: "OTP Email Sent",
            description: "Check your email for otp email verification code!",
          });
          setStep("otp");
        },  
        onError: (error) => {
          toast({
            title: "OTP Email Failed",
            description: (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || (error as any)?.response?.data || error?.message || "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  // otp setup
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!otp || otp === "") {
      toast({
        title: "Error",
        description: "Please enter your otp",
        variant: "destructive",
      });
      return;
    }

    if(otp.length < 6) {
      toast({
        title: "Error",
        description: "otp will not be less or greater than 6 characters",
        variant: "destructive",
      });
      return;
    }
    setStep("reset");
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid(newPassword)) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      email,
      newPassword,
      code: otp,
    }

    resetPasswordMutation(payload,
      {
        onSuccess: () => {
          toast({
            title: "Password Reset",
            description: "Your password has been reset successfully!",
          }); 
          navigate("/")
        },  
        onError: (error) => {
          toast({
            title: "Password Reset Failed",
            description: (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || (error as any)?.response?.data || error?.message || "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  }

  const handleBack = () => {
    if(step === "reset") {
      setStep("otp");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }else {
      setStep("email");
      setEmail("");
      setOtp("");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md crypto-glow flex flex-col relative ">
        {
          step !== "email" && (
            <CircleArrowLeft 
              className="w-6 h-6 cursor-pointer absolute top-4 left-4 z-10 text-gray-500 hover:text-gray-400 rounded-full font-normal active:scale-95" 
              onClick={handleBack}
            />
          )
        }
        

        <TradovateLogo />
        <CardHeader className="text-center pt-0">
          <CardTitle className="text-2xl font-bold text-primary">Reset Password</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Enter your email to receive a reset link"
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending..." : "Send otp"}
              </Button>
            </form>
          ) : step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="number"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Set OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <PasswordValidator password={newPassword} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetPasswordPending || !isPasswordValid(newPassword)}
              >
                {resetPasswordPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

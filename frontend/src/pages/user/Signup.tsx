import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isPasswordValid } from "@/components/PasswordValidator";
import { useCreateData } from "@/hooks/use-api";
import { AUTH } from "@/hooks/apiEndpoint";
import { set } from "date-fns";
import TradovateLogo from "@/components/TradovateLogo";

const UserSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  const { mutate } = useCreateData(AUTH.SIGNUP, ["signup"])
  const { mutate: verifyEmailMutation } = useCreateData(AUTH.VERIFY_EMAIL, ["verify-email"])

  // Password validation
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const hasValidLength = formData.password.length >= 6 && formData.password.length <= 12;

  const isPasswordValid = hasUpperCase && hasLowerCase && hasSpecialChar && hasValidLength;

  const ValidationCheck = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? "text-success" : "text-muted-foreground"}`}>
      {met ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span>{text}</span>
    </div>
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const payLoad = {
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName, 
    };
    

    mutate(payLoad,
      {
        onSuccess: () => {
          toast({
            title: "Signup Successful",
            description: "Check your email for verification code!",
          });
          // navigate("/dashboard");
          setLoading(false);
        },  
        onError: (error) => {
          toast({
            title: "Signup Failed",
            description: error.message || "Something went wrong",
            variant: "destructive",
          });
          setLoading(false);
        },
      }
    );
  };

  const handleVerifyMail = async (e: React.FormEvent) => {
    e.preventDefault();


    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setOtpLoading(true);

    const payLoad = {
      email: formData.email,
      code: formData.otp,
    };
    

    verifyEmailMutation(payLoad,
      {
        onSuccess: () => {
          toast({
            title: "Email Verified",
            description: "your account has been verified successfully",
          });
          navigate("/");
          setFormData({
            fullName: "",
            email: "",
            password: "",
            otp: "",
            agreeToTerms: false,
          });
          setOtpLoading(false);
        },  
        onError: (error) => {
          toast({
            title: "Signup Failed",
            description: error.message || "Something went wrong",
            variant: "destructive",
          });
          setOtpLoading(false);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md flex flex-col max-h-[90vh]">
        <TradovateLogo />
        <CardHeader className="space-y-1 pt-0 h-fit">
          <CardTitle className="text-2xl font-bold text-center pt-0">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Tradovate future and start trading today
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerifyMail} className="flex-1 overflow-auto no-scrollbar">
          {/* <form onSubmit={handleSignup}> */}
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="space-y-1 pt-2">
                  <ValidationCheck met={hasUpperCase} text="One uppercase letter" />
                  <ValidationCheck met={hasLowerCase} text="One lowercase letter" />
                  <ValidationCheck met={hasSpecialChar} text="One special character" />
                  <ValidationCheck met={hasValidLength} text="Length between 6-12 characters" />
                </div>
              </div>

            </CardContent>
          {/* </form> */}
          <CardContent className="flex items-center gap-5">
            <Input
              id="otp"
              type="number"
              placeholder="Enter OTP"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              required
            />
            <Button 
              type="submit" 
              className="w-fit" 
              disabled={loading}
              onClick={handleSignup}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </CardContent>
          <div className="flex items-center space-x-2 px-5 pb-5">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, agreeToTerms: checked as boolean })
              }
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                terms and conditions
              </a>
            </label>
          </div>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={otpLoading || !isPasswordValid}>
              {otpLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default UserSignup;

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCheck, Clock, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import useKyc from "@/hooks/useKYC";
import { KYC } from "@/hooks/apiEndpoint";
import { useCreateData, useFetchData } from "@/hooks/use-api";

const UserKYC = () => {
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
    front: null,
    back: null,
  });
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const { user, isLoading: authLoading, refetch: refetchUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const { kycList, updateKyc } = useKyc();

  const { data: existingKyc, isLoading: kycLoading } = useFetchData<{
    success: boolean;
    kyc: string; // Assuming this returns one string, or maybe object? User said "kyc" key is image url.
  }>(KYC.ME, "user-kyc");

  // Based on admin kyc logic, it seems frontImage and backImage are in the kyc record.
  // But user said: "expected responce is { success: true, kyc: 'string' } when the 'kyc' key is th image url"
  // Wait, if it says "both front and back files will have their separate or individual card", 
  // and "/kyc/me/" returns a single string, how do I get both?
  // Let's re-read: "follow the way all users kyc was fetch and displayed on admin/src/pages/admin/KYC.tsx"
  // Admn kyc uses KycRecord which has frontImage and backImage.
  // Maybe "/kyc/me/" returns one record? 
  // User also says: "map the data fetched into @KYC.tsx#L231-254"
  // L231-254 in original KYC.tsx was mapping kycList.

  const handleFileChange = (type: "front" | "back", e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      updateKyc(type, selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(selectedFile);
      toast({
        title: `${type.toUpperCase()} ID selected successfully`,
        variant: "default",
      });
    }
  };

  const { mutate, isPending } = useCreateData(KYC.SUBMIT, ["submit-kyc"], true);

  const handleSubmit = async () => {
    if (kycList?.length < 2) {
      toast({
        title: "Please upload both front and back of your ID",
        variant: "destructive",
      });
      return;
    }

    const front = kycList.find((item) => item.kycType === "front");
    const back = kycList.find((item) => item.kycType === "back");

    const payload = {
      front: front?.file,
      back: back?.file,
    };

    console.log("payload", payload);

    mutate(payload, {
      onSuccess: () => {
        toast({
          title: "KYC",
          description: "Submitted successfully",
        });
        refetchUser();
      },
      onError: (error) => {
        toast({
          title: "KYC Failed",
          description:
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.error ||
            (error as any)?.response?.data ||
            error?.message ||
            "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (authLoading || kycLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isPendingStatus = user?.kycStatus === "PENDING" || !existingKyc?.success;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">
            Submit your identity documents for verification
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {isPendingStatus ? (
            <>
              {/* Front ID Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Front of ID</CardTitle>
                  <CardDescription>
                    Upload the front side of your government-issued ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => frontInputRef.current?.click()}
                  >
                    {previews.front ? (
                      <img
                        src={previews.front}
                        alt="Front Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload front</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange("front", e)}
                  />
                </CardContent>
              </Card>

              {/* Back ID Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Back of ID</CardTitle>
                  <CardDescription>
                    Upload the back side of your government-issued ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => backInputRef.current?.click()}
                  >
                    {previews.back ? (
                      <img
                        src={previews.back}
                        alt="Back Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload back</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange("back", e)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isPending}
                  >
                    {isPending ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* View Submitted Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Front ID Document</CardTitle>
                  <CardDescription>Verification Status: {user?.kycStatus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <img
                      src={(existingKyc as any)?.kyc?.frontImage || (existingKyc as any)?.kyc}
                      alt="Front ID"
                      className="w-full object-contain max-h-[400px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Back ID Document</CardTitle>
                  <CardDescription>Verification Status: {user?.kycStatus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-muted/20">
                    <img
                      src={(existingKyc as any)?.kyc?.backImage || (existingKyc as any)?.kyc}
                      alt="Back ID"
                      className="w-full object-contain max-h-[400px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserKYC;

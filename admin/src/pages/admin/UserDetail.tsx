import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFetchData, usePatchData, useCreateData } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Wallet,
  RefreshCw,
  Shield,
  UserCheck,
  Mail,
  Calendar,
  Key,
} from "lucide-react";

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isEditingWallet, setIsEditingWallet] = useState<string | null>(null);
  const [walletEditData, setWalletEditData] = useState({
    address: "",
    balance: "",
  });

  // Fetch user data
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useFetchData<any>(`/admin/users/${id}`, `adminUser-${id}`);

  // Update wallet mutation
  const updateWalletMutation = usePatchData<
    any,
    { address: string; balance: number }
  >(
    (data) => `/admin/wallets/${isEditingWallet}`, // Dynamic endpoint
    [`adminUser-${id}`] // Invalidate user cache
  );

  // Update role mutation
  const updateRoleMutation = usePatchData<any, { role: string }>(
    `/admin/users/${id}/role`,
    [`adminUser-${id}`]
  );

  // Verify user mutation (using POST)
  const verifyUserMutation = useCreateData<any, { verify: boolean }>(
    `/admin/users/${id}/verify`,
    [`adminUser-${id}`]
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return <AlertCircle className="w-4 h-4 mr-1" />;
    }
  };

  const handleUpdateWallet = async (walletId: string) => {
    if (!walletEditData.address.trim()) {
      toast({
        title: "Error",
        description: "Wallet address is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateWalletMutation.mutateAsync({
        address: walletEditData.address,
        balance: parseFloat(walletEditData.balance) || 0,
      });
      setIsEditingWallet(null);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleUpdateRole = async (role: string) => {
    try {
      await updateRoleMutation.mutateAsync({ role });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleVerifyUser = async () => {
    try {
      await verifyUserMutation.mutateAsync({
        verify: !user?.isVerified,
      });
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading user details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Failed to load user</h2>
          <p>{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="text-center py-12">
          <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">
            The requested user does not exist
          </p>
          <Link to="/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    );

  const startEditWallet = (wallet: any) => {
    setIsEditingWallet(wallet.id);
    setWalletEditData({
      address: wallet.address || "",
      balance: wallet.balance?.toString() || "0",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/users"
            className="inline-flex items-center text-sm text-primary hover:underline mb-4"
          >
            ← Back to users
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {user.name || user.email}
                </h1>
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={
                    user.isVerified
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  }
                >
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Key className="w-4 h-4" />
                    {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={updateRoleMutation.isPending}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update User Role</DialogTitle>
                  </DialogHeader>
                  <Select
                    onValueChange={handleUpdateRole}
                    defaultValue={user.role}
                    disabled={updateRoleMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button 
                      onClick={() => {
                        // Role is updated on change
                      }}
                      disabled={updateRoleMutation.isPending}
                    >
                      {updateRoleMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Role"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant={user.isVerified ? "outline" : "default"}
                size="sm"
                onClick={handleVerifyUser}
                disabled={verifyUserMutation.isPending}
              >
                {verifyUserMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : user.isVerified ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Unverify
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Verify User
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & KYC */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Profile Information</h2>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">
                    Email Address
                  </dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">Role</dt>
                  <dd className="font-medium capitalize">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">
                    Verification Status
                  </dt>
                  <dd>
                    <Badge
                      variant="outline"
                      className={`flex items-center w-fit ${getStatusColor(
                        user.isVerified ? "verified" : "pending"
                      )}`}
                    >
                      {user.isVerified ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {user.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground mb-1">
                    Account Created
                  </dt>
                  <dd>{new Date(user.createdAt).toLocaleString()}</dd>
                </div>
                {user.lastLogin && (
                  <div>
                    <dt className="text-sm text-muted-foreground mb-1">
                      Last Login
                    </dt>
                    <dd>{new Date(user.lastLogin).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* KYC Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">KYC Verification</h2>
                </div>
                {user.kyc && (
                  <Badge
                    variant="outline"
                    className={`flex items-center ${getStatusColor(
                      user.kyc.status
                    )}`}
                  >
                    {getStatusIcon(user.kyc.status)}
                    {user.kyc.status}
                  </Badge>
                )}
              </div>

              {user.kyc ? (
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm text-muted-foreground mb-1">
                      Full Name
                    </dt>
                    <dd>{user.kyc.fullName}</dd>
                  </div>
                  {user.kyc.idNumber && (
                    <div>
                      <dt className="text-sm text-muted-foreground mb-1">
                        ID Number
                      </dt>
                      <dd className="font-mono">{user.kyc.idNumber}</dd>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Front Image
                      </p>
                      <img
                        src={user.kyc.frontImage}
                        alt="ID Front"
                        className="w-full h-40 object-cover rounded border"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Back Image
                      </p>
                      <img
                        src={user.kyc.backImage}
                        alt="ID Back"
                        className="w-full h-40 object-cover rounded border"
                      />
                    </div>
                  </div>
                  {user.kyc.verifiedAt && (
                    <div className="text-sm text-muted-foreground">
                      Verified on{" "}
                      {new Date(user.kyc.verifiedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No KYC submitted</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    User hasn't completed KYC verification
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Wallets & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallets Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Wallets</h2>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {user.wallets?.length || 0} wallets
                </Badge>
              </div>

              <div className="space-y-4">
                {user.wallets?.map((wallet: any) => (
                  <div key={wallet.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            wallet.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="font-semibold">
                          {wallet.coin?.name || wallet.coin?.symbol}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {wallet.coin?.symbol}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditWallet(wallet)}
                        disabled={updateWalletMutation.isPending}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>

                    {isEditingWallet === wallet.id ? (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Wallet Address
                          </label>
                          <Input
                            value={walletEditData.address}
                            onChange={(e) =>
                              setWalletEditData({
                                ...walletEditData,
                                address: e.target.value,
                              })
                            }
                            placeholder="Enter wallet address"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground mb-1 block">
                            Balance
                          </label>
                          <Input
                            type="number"
                            value={walletEditData.balance}
                            onChange={(e) =>
                              setWalletEditData({
                                ...walletEditData,
                                balance: e.target.value,
                              })
                            }
                            placeholder="Enter balance"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateWallet(wallet.id)}
                            disabled={updateWalletMutation.isPending}
                          >
                            {updateWalletMutation.isPending ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingWallet(null)}
                            disabled={updateWalletMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Network
                          </p>
                          <p className="font-medium text-sm">
                            {wallet.network?.name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Address
                          </p>
                          <p className="font-mono text-sm break-all">
                            {wallet.address || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Balance
                          </p>
                          <p className="font-semibold">
                            {wallet.balance} {wallet.coin?.symbol}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {!user.wallets?.length && (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No wallets found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Transactions Card */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recent Transactions</h2>
                </div>
                <Link
                  to={`/transactions?userId=${id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.transactions?.slice(0, 10).map((t: any) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {t.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {t.amount} {t.currency}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`flex items-center w-fit ${getStatusColor(
                              t.status
                            )}`}
                          >
                            {getStatusIcon(t.status)}
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {!user.transactions?.length && (
                  <div className="text-center py-8">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No transactions found
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
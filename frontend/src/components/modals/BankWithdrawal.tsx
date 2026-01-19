import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCreateData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";

interface BankWithdrawalProps {
    withdrawOpen: boolean;
    setWithdrawOpen: (open: boolean) => void;
    coins: any;
    refetch: () => void;
    isLoading: boolean;
}

const BankWithdrawal = ({
    withdrawOpen,
    setWithdrawOpen,
    coins,
    refetch,
}: BankWithdrawalProps) => {
    const [selectedCoin, setSelectedCoin] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");

    const { toast } = useToast();

    const { mutate: withdrawMutate, isPending: withdrawPending } = useCreateData(COINS.BANK_WITHDRAW, ["withdraw_bank"])

    const selectedCoinData = useMemo(() => {
        const coin = coins?.find((coin: any) => coin.walletId === selectedCoin);
        return coin;
    }, [coins, selectedCoin]);

    const handleWithdraw = async () => {
        if (!selectedCoin || !withdrawAmount || !bankName || !accountName || !accountNumber || !ifscCode) {
            toast({ title: "Please fill all fields", variant: "destructive" });
            return;
        }
        if (Number(withdrawAmount) <= 0) {
            toast({ title: "Amount must be greater than 0", variant: "destructive" });
            return;
        }
        if (selectedCoinData?.balance < Number(withdrawAmount)) {
            toast({ title: "Insufficient balance", variant: "destructive" });
            return;
        }

        const payload = {
            walletId: selectedCoin,
            amount: +withdrawAmount,
            bankName,
            accountName,
            accountNumber,
            ifscCode
        }

        withdrawMutate(payload, {
            onSuccess: () => {
                toast({
                    title: "Bank withdrawal request created",
                    description: "Withdrawal request submitted successfully!",
                });
                setWithdrawOpen(false);
                refetch();

                // Reset form
                setWithdrawAmount("");
                setBankName("");
                setAccountName("");
                setAccountNumber("");
                setIfscCode("");
                setSelectedCoin("");
            },
            onError: (error) => {
                toast({
                    title: "Withdrawal creation failed",
                    description: (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || (error as any)?.response?.data || error?.message || "Something went wrong",
                    variant: "destructive",
                });
            },
        });
    }

    return (
        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bank Withdrawal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Wallet</Label>
                        <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select wallet" />
                            </SelectTrigger>
                            <SelectContent>
                                {coins?.map((coin: any, index: number) => (
                                    <SelectItem key={coin.walletId + index} value={coin.walletId}>
                                        <div className="flex items-center gap-2">
                                            <img src={coin?.coin?.iconUrl} alt={coin?.coin?.name} className="w-6 h-6" />
                                            <span>{coin?.coin?.symbol}</span>
                                            {coin?.network?.name && (
                                              <span className="text-xs text-muted-foreground">
                                                ({coin.network.name})
                                              </span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {
                        selectedCoinData && (
                            <div className="space-y-2 border-b pb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <Label className="text-muted-foreground">Available Balance</Label>
                                    <p className="text-success font-semibold">${selectedCoinData?.balance}</p>
                                </div>
                                {selectedCoinData?.network?.name && (
                                  <div className="flex items-center justify-between gap-2">
                                    <Label className="text-muted-foreground">Network</Label>
                                    <div className="flex items-center gap-2">
                                      {selectedCoinData.network.icon && (
                                        <img
                                          src={selectedCoinData.network.icon}
                                          alt={selectedCoinData.network.name}
                                          className="h-4 w-4"
                                        />
                                      )}
                                      <p className="font-medium text-sm">{selectedCoinData.network.name}</p>
                                    </div>
                                  </div>
                                )}
                            </div>
                        )
                    }
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bank Name</Label>
                        <Input
                            placeholder="First National Bank"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                            placeholder="John Doe"
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input
                            placeholder="0123456789"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>IFSC Code</Label>
                        <Input
                            placeholder="IFSC0001234"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value)}
                        />
                    </div>

                    <Button className="w-full" disabled={withdrawPending} onClick={handleWithdraw}>
                        {withdrawPending ? "Processing..." : "Submit Withdrawal Request"}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                        Withdrawals require admin approval
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default BankWithdrawal

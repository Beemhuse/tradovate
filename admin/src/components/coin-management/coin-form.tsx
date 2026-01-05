// src/components/coin-management/CoinForm.tsx
import React, { useState, useEffect } from "react";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Globe, Network as NetworkIcon } from "lucide-react";
import { CreateCoinPayload, Network } from "@/types/coins";
import NetworkCard from "./network-card";
import { getCoins, CoinGeckoCoin } from "@/services/all-coins";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  networks: Network[]; // available networks (fetched or fallback)
  initial?: Partial<CreateCoinPayload> & { name?: string; symbol?: string; iconUrl?: string; isActive?: boolean; };
  onCancel: () => void;
  onSubmit: (payload: CreateCoinPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

const CoinForm: React.FC<Props> = ({ networks, initial, onCancel, onSubmit, isSubmitting }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: initial?.name || "",
    symbol: initial?.symbol || "",
    iconUrl: initial?.iconUrl || "",
    isActive: initial?.isActive ?? true,
    networkId: initial?.networkName || "",
    contractAddress: initial?.contractAddress || "",
    decimals: initial?.decimals ?? 18,
    requiresContractAddress: false,
    customNetworkName: "",
    customNetworkType: "",
  });
  const [coins, setCoins] = useState<CoinGeckoCoin[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      const data = await getCoins();
      setCoins(data);
      console.log("allCoins", data);
    };
    fetchCoins();
  }, []);


  useEffect(() => {
    // update requirement when network changes
    const selected = networks.find((n) => n.id === form.networkId);
    setForm((s) => ({ ...s, requiresContractAddress: selected ? selected.type !== "Native" : false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.networkId, networks]);

  const validateStep1 = () => form.name.trim() !== "" && form.symbol.trim() !== "";
  const validateStep2 = () => {
    if (!form.networkId || form.networkId === "custom") {
      // if custom network and non-native, require contract address
      if (form.networkId === "custom" && form.customNetworkType !== "Native") {
        return form.contractAddress.trim() !== "";
      }
      return true;
    }
    const selected = networks.find((n) => n.id === form.networkId);
    if (!selected) return true;
    if (selected.type === "Native") return true;
    return form.contractAddress.trim() !== "";
  };

  const canProceed = validateStep1();
  const canSubmit = validateStep1() && validateStep2();

  const preparePayload = (): CreateCoinPayload => {
    const payload: any = {
      symbol: form.symbol.toUpperCase(),
      name: form.name,
      iconUrl: form.iconUrl || undefined,
      isActive: form.isActive,
      decimals: form.decimals,
    };

    if (form.networkId && form.networkId !== "custom") {
      const selected = networks.find((n) => n.id === form.networkId);
      if (selected) {
        payload.networkName = selected.name;
        payload.networkType = selected.type;
        if (form.contractAddress) payload.contractAddress = form.contractAddress;
      }
    } else if (form.networkId === "custom") {
      payload.networkName = form.customNetworkName;
      payload.networkType = form.customNetworkType;
      if (form.contractAddress) payload.contractAddress = form.contractAddress;
    }

    return payload as CreateCoinPayload;
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>{currentStep === 1 ? "Create New Coin" : "Configure Network"}</DialogTitle>
          <Badge variant="outline" className="text-xs">Step {currentStep} of 2</Badge>
        </div>
        <DialogDescription>
          {currentStep === 1 ? "Enter basic coin information" : "Optionally link this coin to a network"}
        </DialogDescription>
      </DialogHeader>

      {currentStep === 1 ? (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Coin Name</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {form.name
                      ? form.name
                      : "Select coin..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search coin..." />
                    <CommandList>
                      <CommandEmpty>No coin found.</CommandEmpty>
                      <CommandGroup>
                        {coins.map((coin) => (
                          <CommandItem
                            key={coin.symbol}
                            value={coin.name}
                            onSelect={(currentValue) => {
                              const selectedCoin = coins.find(
                                (c) => c.name.toLowerCase() === currentValue.toLowerCase()
                              );
                              if (selectedCoin) {
                                setForm({
                                  ...form,
                                  name: selectedCoin.name,
                                  symbol: selectedCoin.symbol.toUpperCase(),
                                  iconUrl: selectedCoin.image,
                                });
                              }
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.name === coin.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-2">
                              <img src={coin.image} alt={coin.name} className="w-4 h-4 rounded-full" />
                              {coin.name}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Symbol</Label>
              <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon URL (optional)</Label>
            <Input value={form.iconUrl} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} />
            <p className="text-xs text-muted-foreground">Emoji, image URL or SVG is fine</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-muted-foreground">Set whether this coin is active</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{form.isActive ? "Active" : "Inactive"}</span>
              <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 py-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <NetworkIcon className="h-5 w-5 text-muted-foreground" />
              <Label>Select Network (Optional)</Label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                className={`p-3 border rounded-lg text-left ${form.networkId === "" ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                onClick={() => setForm({ ...form, networkId: "" })}
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <div>
                    <div className="font-medium">No Network</div>
                    <div className="text-xs text-muted-foreground">Native coin only</div>
                  </div>
                </div>
              </button>

              {networks.map((n) => (
                <NetworkCard key={n.id} network={n} selected={form.networkId === n.id} onSelect={(id) => setForm({ ...form, networkId: id })} />
              ))}

              <button
                type="button"
                className={`p-3 border rounded-lg text-left ${form.networkId === "custom" ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                onClick={() => setForm({ ...form, networkId: "custom" })}
              >
                <div className="font-medium">Custom Network</div>
                <div className="text-xs text-muted-foreground">Provide custom network fields</div>
              </button>
            </div>
          </div>

          {form.networkId && form.networkId !== "custom" && (
            <>
              <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
                <Label>Contract Address {form.requiresContractAddress ? "*" : ""}</Label>
                <Input value={form.contractAddress} onChange={(e) => setForm({ ...form, contractAddress: e.target.value })} className="font-mono text-sm" />
                <Label>Decimals</Label>
                <Input type="number" value={form.decimals} onChange={(e) => setForm({ ...form, decimals: parseInt(e.target.value || "18") })} />
              </div>
            </>
          )}

          {form.networkId === "custom" && (
            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
              <Label>Network Name</Label>
              <Input value={form.customNetworkName} onChange={(e) => setForm({ ...form, customNetworkName: e.target.value })} />
              <Label>Network Type</Label>
              <Input value={form.customNetworkType} onChange={(e) => setForm({ ...form, customNetworkType: e.target.value })} />
              <Label>Contract Address (if applicable)</Label>
              <Input value={form.contractAddress} onChange={(e) => setForm({ ...form, contractAddress: e.target.value })} />
            </div>
          )}
        </div>
      )}

      <DialogFooter className="flex justify-between pt-6 border-t">
        {currentStep === 1 ? (
          <>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={() => setCurrentStep(2)} disabled={!canProceed}>Next: Configure Network <ChevronRight className="h-4 w-4 ml-2" /></Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setCurrentStep(1)}><ChevronLeft className="h-4 w-4 mr-2" />Back</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { onSubmit(preparePayload()); }} disabled={isSubmitting}>Skip Network</Button>
              <Button onClick={() => { if (canSubmit) onSubmit(preparePayload()); }} disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? "Creating..." : "Create Coin"}
              </Button>
            </div>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default CoinForm;

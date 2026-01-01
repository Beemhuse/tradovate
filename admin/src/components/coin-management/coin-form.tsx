import React, { useState } from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { CreateCoinPayload, Network } from "@/types/coins";
import NetworkCard from "./network-card";

type Props = {
  networks: Network[];
  onCancel: () => void;
  onSubmit: (payload: CreateCoinPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

const CoinForm: React.FC<Props> = ({
  networks,
  onCancel,
  onSubmit,
  isSubmitting,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    iconUrl: "",
    isActive: true,
    networkId: "",
    contractAddress: "",
    decimals: 18,
  });

  const selectedNetwork = networks.find(
    (n) => n.id === form.networkId
  );

  const requiresContract =
    selectedNetwork && selectedNetwork.type !== "Native";

  const canProceed = form.name && form.symbol;
  const canSubmit =
    canProceed && (!requiresContract || form.contractAddress);

  const submit = () => {
    const payload: CreateCoinPayload = {
      name: form.name,
      symbol: form.symbol.toUpperCase(),
      iconUrl: form.iconUrl || undefined,
      isActive: form.isActive,
      decimals: form.decimals,
    };

    if (form.networkId) {
      payload.networkId = form.networkId;
      payload.contractAddress = form.contractAddress || undefined;
    }

    onSubmit(payload);
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>
          {step === 1 ? "Create Coin" : "Link Network"}
        </DialogTitle>
        <DialogDescription>
          {step === 1
            ? "Enter basic coin information"
            : "Optionally attach this coin to a network"}
        </DialogDescription>
        <Badge variant="outline">Step {step} of 2</Badge>
      </DialogHeader>

      {step === 1 && (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Symbol</Label>
              <Input
                value={form.symbol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    symbol: e.target.value.toUpperCase(),
                  })
                }
              />
            </div>
          </div>

          <Label>Icon URL</Label>
          <Input
            value={form.iconUrl}
            onChange={(e) =>
              setForm({ ...form, iconUrl: e.target.value })
            }
          />

          <div className="flex items-center justify-between pt-4 border-t">
            <Label>Status</Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm({ ...form, isActive: v })
              }
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            {networks.map((n) => (
              <NetworkCard
                key={n.id}
                network={n}
                selected={form.networkId === n.id}
                onSelect={(id) =>
                  setForm({ ...form, networkId: id })
                }
              />
            ))}
          </div>

          {form.networkId && requiresContract && (
            <>
              <Label>Contract Address</Label>
              <Input
                value={form.contractAddress}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contractAddress: e.target.value,
                  })
                }
              />

              <Label>Decimals</Label>
              <Input
                type="number"
                value={form.decimals}
                onChange={(e) =>
                  setForm({
                    ...form,
                    decimals: Number(e.target.value),
                  })
                }
              />
            </>
          )}
        </div>
      )}

      <DialogFooter className="flex justify-between pt-4 border-t">
        {step === 1 ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setStep(2)} disabled={!canProceed}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={submit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create Coin"}
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

export default CoinForm;

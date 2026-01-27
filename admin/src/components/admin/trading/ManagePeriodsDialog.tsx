import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFetchData, useCreateData, usePatchData, useDeleteData } from "@/hooks/use-api";
import { TradingPair } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pair: TradingPair | null;
}

const ManagePeriodsDialog = ({ open, onOpenChange, pair }: Props) => {
  const pairId = pair?.id ?? null;
  const { data, refetch } = useFetchData(pairId ? `/market/pairs/${pairId}` : null, pairId ? `market-pair-${pairId}` : null as any);
  const configs: any[] = data?.pair?.tradeConfigs ?? [];

  const [period, setPeriod] = useState("S30");
  const [minStake, setMinStake] = useState(1);
  const [maxStake, setMaxStake] = useState(10);
  const [profitRate, setProfitRate] = useState(0.8);

  const createConfig = useCreateData("/market/configs", ["market-pairs"]);
  const patchConfig = usePatchData((payload: any) => `/market/configs/${payload.id}`, ["market-pairs"]);
  const deleteConfig = useDeleteData((id: string) => `/market/configs/${id}`, ["market-pairs"]);

  const handleCreate = () => {
    if (!pairId) return;
    createConfig.mutate({ marketPairId: pairId, period, minStake, maxStake, profitRate });
  };

  const handlePatch = (id: string, body: any) => {
    patchConfig.mutate({ id, ...body });
  };

  const handleDelete = (id: string) => {
    deleteConfig.mutate(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Trade Periods for {pair?.symbol}</DialogTitle>
          <DialogDescription>View, create, edit or delete trade periods (configs) for this pair.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 gap-2 items-end">
            <div>
              <Label>Period</Label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full border rounded px-2 py-1 bg-background">
                <option value="S30">30s</option>
                <option value="M1">1m</option>
                <option value="M5">5m</option>
                <option value="M15">15m</option>
              </select>
            </div>
            <div>
              <Label>Min Stake</Label>
              <Input type="number" value={minStake} onChange={(e) => setMinStake(Number(e.target.value))} />
            </div>
            <div>
              <Label>Max Stake</Label>
              <Input type="number" value={maxStake} onChange={(e) => setMaxStake(Number(e.target.value))} />
            </div>
            <div>
              <Label>Profit Rate</Label>
              <Input type="number" step="0.01" value={profitRate} onChange={(e) => setProfitRate(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!pairId}>Create Period</Button>
            <Button variant="ghost" onClick={() => refetch && refetch()}>Refresh</Button>
          </div>

          <div className="space-y-2">
            {configs.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 border rounded p-3">
                <div>
                  <div className="font-medium">{c.period}</div>
                  <div className="text-sm text-muted-foreground">Min: {c.minStake} • Max: {c.maxStake} • Profit: {Number(c.profitRate)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handlePatch(c.id, { isActive: !c.isActive })}>{c.isActive ? 'Disable' : 'Enable'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => handlePatch(c.id, { minStake: Number(c.minStake), maxStake: Number(c.maxStake) })}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePeriodsDialog;

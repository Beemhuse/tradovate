import { useState } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminTradingPairs = () => {
  const [open, setOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("");
  const [minOrder, setMinOrder] = useState("0.001");
  const [maxOrder, setMaxOrder] = useState("1000000");
  const [makerFee, setMakerFee] = useState("0.001");
  const [takerFee, setTakerFee] = useState("0.001");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coins } = useQuery({
    queryKey: ["coins-for-pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coins")
        .select("*")
        .eq("is_active", true)
        .neq("symbol", "USDT");

      if (error) throw error;
      return data;
    },
  });

  const { data: tradingPairs, isLoading } = useQuery({
    queryKey: ["trading-pairs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_pairs")
        .select(`*, coins (name, symbol)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createPair = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trading_pairs").insert({
        base_coin_id: selectedCoin,
        quote_symbol: "USDT",
        min_order_size: parseFloat(minOrder),
        max_order_size: parseFloat(maxOrder),
        maker_fee: parseFloat(makerFee),
        taker_fee: parseFloat(takerFee),
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-pairs"] });
      toast({ title: "Trading pair created" });
      setOpen(false);
      resetForm();
    },
  });

  const togglePair = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("trading_pairs")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-pairs"] });
      toast({ title: "Trading pair updated" });
    },
  });

  const resetForm = () => {
    setSelectedCoin("");
    setMinOrder("0.001");
    setMaxOrder("1000000");
    setMakerFee("0.001");
    setTakerFee("0.001");
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading Pairs</h1>
            <p className="text-muted-foreground">Manage trading pairs and fees</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Pair
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Trading Pair</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Base Coin</Label>
                  <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {coins?.map((coin) => (
                        <SelectItem key={coin.id} value={coin.id}>
                          {coin.name} ({coin.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Order Size</Label>
                    <Input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Order Size</Label>
                    <Input
                      type="number"
                      value={maxOrder}
                      onChange={(e) => setMaxOrder(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maker Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={makerFee}
                      onChange={(e) => setMakerFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taker Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={takerFee}
                      onChange={(e) => setTakerFee(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createPair.mutate()}
                  disabled={!selectedCoin}
                >
                  Create Pair
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Trading Pairs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Pair</th>
                      <th className="text-right py-3 px-4">Min Order</th>
                      <th className="text-right py-3 px-4">Max Order</th>
                      <th className="text-right py-3 px-4">Maker Fee</th>
                      <th className="text-right py-3 px-4">Taker Fee</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradingPairs?.map((pair) => (
                      <tr key={pair.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="py-4 px-4 font-medium">
                          {pair.coins?.symbol}/USDT
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          {Number(pair.min_order_size).toFixed(8)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          {Number(pair.max_order_size).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {(Number(pair.maker_fee) * 100).toFixed(2)}%
                        </td>
                        <td className="py-4 px-4 text-right">
                          {(Number(pair.taker_fee) * 100).toFixed(2)}%
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Switch
                            checked={pair.is_active}
                            onCheckedChange={(checked) =>
                              togglePair.mutate({ id: pair.id, isActive: checked })
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTradingPairs;

import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminCoins = () => {
  const [coins, setCoins] = useState([
    { id: 1, name: "Bitcoin", symbol: "BTC", icon: "₿", wallet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", active: true },
    { id: 2, name: "Ethereum", symbol: "ETH", icon: "Ξ", wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", active: true },
    { id: 3, name: "Tether", symbol: "USDT", icon: "₮", wallet: "0x1234567890abcdef1234567890abcdef12345678", active: true },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCoin, setNewCoin] = useState({ name: "", symbol: "", icon: "", wallet: "" });

  const handleAddCoin = () => {
    if (newCoin.name && newCoin.symbol && newCoin.wallet) {
      setCoins([...coins, { ...newCoin, id: coins.length + 1, active: true }]);
      setNewCoin({ name: "", symbol: "", icon: "", wallet: "" });
      setIsDialogOpen(false);
    }
  };

  const toggleCoinStatus = (id: number) => {
    setCoins(coins.map(coin => 
      coin.id === id ? { ...coin, active: !coin.active } : coin
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coin Management</h1>
            <p className="text-muted-foreground">Manage available cryptocurrencies on the platform</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Coin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Coin</DialogTitle>
                <DialogDescription>
                  Enter the details of the new cryptocurrency
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="coin-name">Coin Name</Label>
                  <Input
                    id="coin-name"
                    placeholder="Bitcoin"
                    value={newCoin.name}
                    onChange={(e) => setNewCoin({ ...newCoin, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coin-symbol">Symbol</Label>
                  <Input
                    id="coin-symbol"
                    placeholder="BTC"
                    value={newCoin.symbol}
                    onChange={(e) => setNewCoin({ ...newCoin, symbol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coin-icon">Icon (emoji or character)</Label>
                  <Input
                    id="coin-icon"
                    placeholder="₿"
                    value={newCoin.icon}
                    onChange={(e) => setNewCoin({ ...newCoin, icon: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coin-wallet">Deposit Wallet Address</Label>
                  <Input
                    id="coin-wallet"
                    placeholder="0x..."
                    value={newCoin.wallet}
                    onChange={(e) => setNewCoin({ ...newCoin, wallet: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCoin}>Add Coin</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Icon</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Symbol</th>
                    <th className="text-left py-3 px-4">Wallet Address</th>
                    <th className="text-center py-3 px-4">Status</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.map((coin) => (
                    <tr key={coin.id} className="border-b border-border hover:bg-secondary/50">
                      <td className="py-4 px-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-xl font-bold">{coin.icon}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{coin.name}</td>
                      <td className="py-4 px-4 text-muted-foreground">{coin.symbol}</td>
                      <td className="py-4 px-4 font-mono text-sm">{coin.wallet}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coin.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                        }`}>
                          {coin.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => toggleCoinStatus(coin.id)}
                          >
                            {coin.active ? (
                              <ToggleRight className="h-4 w-4 text-success" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-danger">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCoins;

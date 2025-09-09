import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEtherVeilVault } from "@/hooks/useContract";
import { Plus, Minus, ArrowUpDown } from "lucide-react";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: number;
  icon: string;
  protocol?: string;
}

interface AssetListProps {
  assets: Asset[];
  isPrivate: boolean;
}

export const AssetList = ({ assets, isPrivate }: AssetListProps) => {
  const { deposit, withdraw, transfer, isLoading } = useEtherVeilVault();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [action, setAction] = useState<"deposit" | "withdraw" | "transfer">("deposit");

  const formatValue = (val: string) => {
    if (isPrivate) return "••••••";
    return val;
  };

  const handleAction = async () => {
    if (!selectedAsset || !amount) return;

    try {
      switch (action) {
        case "deposit":
          await deposit(parseInt(selectedAsset.id), amount);
          break;
        case "withdraw":
          await withdraw(parseInt(selectedAsset.id), amount);
          break;
        case "transfer":
          if (!recipient) return;
          await transfer(recipient, parseInt(selectedAsset.id), amount);
          break;
      }
      
      // Reset form
      setAmount("");
      setRecipient("");
      setSelectedAsset(null);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground mb-4">Assets</h2>
      
      {assets.map((asset, index) => {
        const changeColor = asset.change24h >= 0 ? "text-accent-green" : "text-accent-red";
        const changeSymbol = asset.change24h >= 0 ? "+" : "";
        
        return (
          <div 
            key={asset.id}
            className="bg-card border border-card-border rounded-lg p-4 card-shadow hover:shadow-card transition-all duration-normal animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl">{asset.icon}</div>
                <div>
                  <div className="font-medium text-foreground">{asset.symbol}</div>
                  <div className="text-sm text-muted-foreground">
                    {asset.protocol ? `${asset.name} • ${asset.protocol}` : asset.name}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-foreground">
                  {formatValue(asset.balance)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatValue(asset.value)}
                </div>
              </div>
              
              <div className={`text-sm font-medium ${changeColor} min-w-[60px] text-right`}>
                {changeSymbol}{asset.change24h.toFixed(2)}%
              </div>
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setAction("deposit");
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit {asset.symbol}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                      />
                      <Button onClick={handleAction} disabled={isLoading} className="w-full">
                        {isLoading ? "Processing..." : "Deposit"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setAction("withdraw");
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw {asset.symbol}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                      />
                      <Button onClick={handleAction} disabled={isLoading} className="w-full">
                        {isLoading ? "Processing..." : "Withdraw"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setAction("transfer");
                      }}
                    >
                      <ArrowUpDown className="w-3 h-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Transfer {asset.symbol}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Recipient Address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                      <Input
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                      />
                      <Button onClick={handleAction} disabled={isLoading} className="w-full">
                        {isLoading ? "Processing..." : "Transfer"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
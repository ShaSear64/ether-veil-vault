import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CheckCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";

interface WalletConnectionProps {
  onConnect?: () => void;
}

export const WalletConnection = ({ onConnect }: WalletConnectionProps) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && onConnect) {
      onConnect();
    }
  }, [isConnected, onConnect]);

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card border border-card-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-accent-green/10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-accent-green" />
          </div>
          <CardTitle className="text-foreground">Wallet Connected</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2">
            <span>{formatAddress(address)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAddress}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your portfolio is now synced with your wallet
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View on Etherscan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card border border-card-border">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-foreground">Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to track your real DeFi positions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {connectors.map((connector) => (
            <Button 
              key={connector.uid}
              onClick={() => handleConnect(connector)}
              disabled={isPending}
              className="w-full"
              size="lg"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect {connector.name}
                </>
              )}
            </Button>
          ))}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>
              Privacy mode encrypts your balance display for screen sharing and public viewing
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
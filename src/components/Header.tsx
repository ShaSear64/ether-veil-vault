import { Eye, EyeOff, Wallet, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  isPrivate: boolean;
  onTogglePrivacy: () => void;
}

export const Header = ({ isPrivate, onTogglePrivacy }: HeaderProps) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const handleConnectWithConnector = async (connector: any) => {
    try {
      await connect({ connector });
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${connector.name}`,
      });
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    try {
      // Try to find MetaMask first, then fallback to other connectors
      const metaMaskConnector = connectors.find(c => c.name === 'MetaMask');
      const connector = metaMaskConnector || connectors[0];
      
      if (!connector) {
        toast({
          title: "No Wallet Found",
          description: "Please install a wallet extension like MetaMask.",
          variant: "destructive",
        });
        return;
      }

      await handleConnectWithConnector(connector);
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from your wallet.",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-header">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <h1 className="text-lg font-semibold text-foreground/90">
            Ether Veil Vault
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePrivacy}
            className="hover:bg-glass border border-glass-border transition-all duration-normal"
          >
            {isPrivate ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>

          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-accent-green/10 border border-accent-green/20 rounded-full">
                <span className="text-sm font-medium text-accent-green">
                  {formatAddress(address)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="hover:bg-glass border border-glass-border transition-all duration-normal"
              >
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-glass border border-glass-border transition-all duration-normal"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {connectors.map((connector) => (
                  <DropdownMenuItem
                    key={connector.uid}
                    onClick={() => handleConnectWithConnector(connector)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>{connector.name}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
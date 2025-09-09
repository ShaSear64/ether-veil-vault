import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Wallet } from "lucide-react";
import { Header } from "@/components/Header";
import { PortfolioCard } from "@/components/PortfolioCard";
import { AssetList } from "@/components/AssetList";
import { useEtherVeilVault } from "@/hooks/useContract";

const Index = () => {
  const { address, isConnected } = useAccount();
  const { portfolioInfo, userBalance } = useEtherVeilVault();
  const [isPrivate, setIsPrivate] = useState(false);
  
  useEffect(() => {
    if (portfolioInfo) {
      setIsPrivate(portfolioInfo[3]); // isPrivate field from contract
    }
  }, [portfolioInfo]);
  
  const handlePrivacyToggle = (newIsPrivate: boolean) => {
    setIsPrivate(newIsPrivate);
  };

  // Format portfolio data from contract
  const formatPortfolioValue = (value: number) => {
    if (isPrivate) return "••••••";
    return `$${(value / 100).toFixed(2)}`; // Assuming value is in cents
  };

  const portfolioData = [
    {
      title: "Total Portfolio Value",
      value: portfolioInfo ? formatPortfolioValue(portfolioInfo[0]) : "$0.00",
      change: -2.34, // This would come from price feeds in a real implementation
      icon: "💰"
    },
    {
      title: "24h P&L",
      value: isPrivate ? "••••••" : "-$2,156.78", // This would be calculated from price changes
      change: -2.41,
      icon: "📊"
    },
    {
      title: "DeFi Yield (APY)",
      value: isPrivate ? "••••••" : "12.4%",
      change: 0.8,
      icon: "🌾"
    }
  ];

  const assets = [
    {
      id: "1",
      symbol: "ETH",
      name: "Ethereum",
      balance: "8.34 ETH",
      value: "$28,945.20",
      change24h: -3.2,
      icon: "Ξ",
      protocol: "Lido Staking"
    },
    {
      id: "2", 
      symbol: "stETH",
      name: "Lido Staked ETH",
      balance: "12.1 stETH",
      value: "$41,987.50",
      change24h: -2.8,
      icon: "🔒",
      protocol: "Lido"
    },
    {
      id: "3",
      symbol: "USDC",
      name: "USD Coin",
      balance: "8,500 USDC",
      value: "$8,500.00",
      change24h: 0.01,
      icon: "💵",
      protocol: "Compound"
    },
    {
      id: "4",
      symbol: "UNI",
      name: "Uniswap",
      balance: "450.23 UNI",
      value: "$4,234.15",
      change24h: -5.67,
      icon: "🦄",
      protocol: "Uniswap V3"
    },
    {
      id: "5",
      symbol: "AAVE",
      name: "Aave Token",
      balance: "28.5 AAVE",
      value: "$5,765.25",
      change24h: 1.23,
      icon: "👻",
      protocol: "Aave V3"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header isPrivate={isPrivate} onTogglePrivacy={handlePrivacyToggle} />
      
      <main className="pt-20 pb-8 px-6 max-w-7xl mx-auto">
        <div className="animate-slide-up">
          {!isConnected ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Connect Your Wallet</h2>
                <p className="text-muted-foreground max-w-md">
                  Please connect your wallet using the button in the top-right corner to access your portfolio.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Portfolio Overview */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-6">
                  DeFi Portfolio Overview
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioData.map((card, index) => (
                    <div key={card.title} style={{ animationDelay: `${index * 100}ms` }}>
                      <PortfolioCard
                        title={card.title}
                        value={card.value}
                        change={card.change}
                        isPrivate={isPrivate}
                        icon={card.icon}
                        onPrivacyToggle={handlePrivacyToggle}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Assets List */}
              <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                <AssetList assets={assets} isPrivate={isPrivate} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

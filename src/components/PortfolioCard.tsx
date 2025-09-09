import { useEtherVeilVault } from "@/hooks/useContract";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PortfolioCardProps {
  title: string;
  value: string;
  change: number;
  isPrivate: boolean;
  icon?: string;
  onPrivacyToggle?: (isPrivate: boolean) => void;
}

export const PortfolioCard = ({ 
  title, 
  value, 
  change, 
  isPrivate,
  icon = "💰",
  onPrivacyToggle
}: PortfolioCardProps) => {
  const { setPortfolioPrivacy, isLoading } = useEtherVeilVault();

  const formatValue = (val: string) => {
    if (isPrivate) return "••••••";
    return val;
  };

  const changeColor = change >= 0 ? "text-accent-green" : "text-accent-red";
  const changeSymbol = change >= 0 ? "+" : "";

  const handlePrivacyToggle = async (checked: boolean) => {
    try {
      await setPortfolioPrivacy(checked);
      onPrivacyToggle?.(checked);
    } catch (error) {
      console.error("Failed to update privacy setting:", error);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-6 card-shadow hover:shadow-card-lg transition-all duration-normal animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex items-center gap-2">
          <div className={`text-sm font-medium ${changeColor}`}>
            {changeSymbol}{change.toFixed(2)}%
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="privacy-mode"
              checked={isPrivate}
              onCheckedChange={handlePrivacyToggle}
              disabled={isLoading}
            />
            <Label htmlFor="privacy-mode" className="text-xs text-muted-foreground">
              Private
            </Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-semibold text-foreground">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
};
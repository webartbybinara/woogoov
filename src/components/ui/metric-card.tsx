import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  className,
  variant = "default" 
}: MetricCardProps) {
  const variantStyles = {
    default: "bg-gradient-card border-border",
    success: "bg-gradient-success border-success/20",
    warning: "bg-warning-light border-warning/20",
    destructive: "bg-destructive-light border-destructive/20"
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:scale-105",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-1",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </p>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            variant === "default" ? "bg-primary-light" : "bg-background/50"
          )}>
            <Icon className={cn("h-5 w-5", iconStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
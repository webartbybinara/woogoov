
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Package, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OrderStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--warning))",
  },
  processing: {
    label: "Processing", 
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--success))",
  },
  cancelled: {
    label: "Cancelled",
    color: "hsl(var(--destructive))",
  },
};

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const exportToCSV = () => {
    const csvContent = [
      ['Status', 'Count'],
      ...data.map(item => [item.status, item.count.toString()])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order-status-data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Status Distribution
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
              outerRadius={window.innerWidth < 640 ? 60 : 80}
              fill="#8884d8"
              dataKey="count"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={activeIndex === index ? "hsl(var(--foreground))" : "none"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "brightness(1)",
                    transition: "all 0.2s ease-in-out"
                  }}
                />
              ))}
            </Pie>
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [value, `${name} orders`]}
                />
              }
            />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-3 mt-6 justify-center">
          {data.map((item, index) => (
            <div 
              key={item.status} 
              className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-muted/50 ${
                activeIndex === index ? 'bg-muted scale-105' : ''
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div 
                className="w-3 h-3 rounded-full shadow-sm" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-sm text-muted-foreground capitalize font-medium">
                {item.status}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

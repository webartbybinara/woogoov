import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Package } from "lucide-react";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-4 mt-4">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="text-sm text-muted-foreground capitalize">
                {item.status}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
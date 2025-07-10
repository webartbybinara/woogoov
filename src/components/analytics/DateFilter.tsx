
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  selectedRange: DateRange;
}

export function DateFilter({ onDateRangeChange, selectedRange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presetRanges: DateRange[] = [
    {
      from: new Date(),
      to: new Date(),
      label: "Today"
    },
    {
      from: new Date(Date.now() - 24 * 60 * 60 * 1000),
      to: new Date(Date.now() - 24 * 60 * 60 * 1000),
      label: "Yesterday"
    },
    {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: "Last 7 days"
    },
    {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: "Last 30 days"
    },
    {
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: "Last 3 months"
    }
  ];

  return (
    <div className="flex flex-col space-y-3 w-full max-w-4xl">
      {/* Modern Pills Design */}
      <div className="flex flex-wrap gap-2">
        {presetRanges.map((range) => (
          <button
            key={range.label}
            onClick={() => onDateRangeChange(range)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
              "border border-border hover:border-primary/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              selectedRange.label === range.label
                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                : "bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {range.label}
          </button>
        ))}
        
        {/* Custom Range Pill */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                "border border-border hover:border-primary/50 flex items-center gap-2",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                selectedRange.label === "Custom Range"
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Calendar className="h-4 w-4" />
              Custom
              <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-6 space-y-4">
              <div className="text-sm font-medium text-foreground mb-4">Select Custom Date Range</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    From Date
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={selectedRange.from}
                    onSelect={(date) => {
                      if (date) {
                        onDateRangeChange({
                          from: date,
                          to: selectedRange.to,
                          label: "Custom Range"
                        });
                      }
                    }}
                    className="p-3 pointer-events-auto border rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    To Date
                  </label>
                  <CalendarComponent
                    mode="single"
                    selected={selectedRange.to}
                    onSelect={(date) => {
                      if (date) {
                        onDateRangeChange({
                          from: selectedRange.from,
                          to: date,
                          label: "Custom Range"
                        });
                        setIsOpen(false);
                      }
                    }}
                    className="p-3 pointer-events-auto border rounded-lg"
                  />
                </div>
              </div>
              
              {selectedRange.label === "Custom Range" && (
                <div className="mt-4 p-3 bg-accent rounded-lg">
                  <div className="text-xs font-medium text-muted-foreground mb-1">Selected Range:</div>
                  <div className="text-sm font-medium">
                    {format(selectedRange.from, "MMM dd, yyyy")} - {format(selectedRange.to, "MMM dd, yyyy")}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Selected Range Display */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span className="font-medium">
          {selectedRange.label === "Custom Range" 
            ? `${format(selectedRange.from, "MMM dd, yyyy")} - ${format(selectedRange.to, "MMM dd, yyyy")}`
            : selectedRange.label
          }
        </span>
      </div>
    </div>
  );
}

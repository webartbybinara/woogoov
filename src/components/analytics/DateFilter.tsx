
import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [isCustomOpen, setIsCustomOpen] = useState(false);

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
      label: "This Week"
    },
    {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: "This Month"
    },
    {
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date(),
      label: "Last 3 months"
    }
  ];

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-[140px] justify-between bg-background border-border hover:bg-accent"
          >
            <span className="text-sm font-normal">
              {selectedRange.label === "Custom Range" 
                ? "Custom" 
                : selectedRange.label
              }
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-[140px] bg-background border-border shadow-md"
        >
          {presetRanges.map((range) => (
            <DropdownMenuItem
              key={range.label}
              onClick={() => onDateRangeChange(range)}
              className={cn(
                "text-sm cursor-pointer flex items-center gap-2",
                selectedRange.label === range.label && "bg-accent"
              )}
            >
              {selectedRange.label === range.label && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
              <span className={selectedRange.label === range.label ? "ml-0" : "ml-3"}>
                {range.label}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <PopoverTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "text-sm cursor-pointer flex items-center gap-2",
                  selectedRange.label === "Custom Range" && "bg-accent"
                )}
              >
                {selectedRange.label === "Custom Range" && (
                  <div className="h-1 w-1 rounded-full bg-primary" />
                )}
                <Calendar className="h-3 w-3" />
                <span className={selectedRange.label === "Custom Range" ? "ml-0" : "ml-0"}>
                  Custom Range
                </span>
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="text-sm font-medium">Select Custom Date Range</div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">From</label>
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
                      className="p-3 pointer-events-auto border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">To</label>
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
                          setIsCustomOpen(false);
                        }
                      }}
                      className="p-3 pointer-events-auto border rounded-md"
                    />
                  </div>
                </div>
                
                {selectedRange.label === "Custom Range" && (
                  <div className="text-xs text-muted-foreground">
                    {format(selectedRange.from, "MMM dd")} - {format(selectedRange.to, "MMM dd, yyyy")}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

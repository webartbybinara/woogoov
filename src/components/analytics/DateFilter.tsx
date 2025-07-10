
import { useState } from "react";
import { Calendar } from "lucide-react";
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
    <div className="w-full">
      {/* Mobile Layout (2 columns) */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {presetRanges.map((range) => (
          <Button
            key={range.label}
            variant={selectedRange.label === range.label ? "default" : "outline"}
            size="sm"
            onClick={() => onDateRangeChange(range)}
            className="text-xs px-2 py-1 h-8 w-full"
          >
            {range.label}
          </Button>
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-8 w-full col-span-2">
              <Calendar className="h-3 w-3 mr-1" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
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
                    className="p-3 pointer-events-auto"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
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
                    className="p-3 pointer-events-auto"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tablet Layout (3 columns for first row, 2 for second) */}
      <div className="hidden sm:grid md:hidden">
        <div className="grid grid-cols-3 gap-2 mb-2">
          {presetRanges.slice(0, 3).map((range) => (
            <Button
              key={range.label}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => onDateRangeChange(range)}
              className="text-sm px-3 py-2 h-9"
            >
              {range.label}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {presetRanges.slice(3).map((range) => (
            <Button
              key={range.label}
              variant={selectedRange.label === range.label ? "default" : "outline"}
              size="sm"
              onClick={() => onDateRangeChange(range)}
              className="text-sm px-3 py-2 h-9"
            >
              {range.label}
            </Button>
          ))}
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-sm px-3 py-2 h-9">
                <Calendar className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
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
                      className="p-3 pointer-events-auto"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
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
                      className="p-3 pointer-events-auto"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Desktop Layout (horizontal flex) */}
      <div className="hidden md:flex md:flex-wrap md:gap-2">
        {presetRanges.map((range) => (
          <Button
            key={range.label}
            variant={selectedRange.label === range.label ? "default" : "outline"}
            size="sm"
            onClick={() => onDateRangeChange(range)}
            className="text-sm"
          >
            {range.label}
          </Button>
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
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
                    className="p-3 pointer-events-auto"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
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
                    className="p-3 pointer-events-auto"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDateToVietnamese, parseVietnameseDate } from "@/lib/utils";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isManualInput, setIsManualInput] = React.useState(false);

  // Convert YYYY-MM-DD to Date object
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    try {
      // Handle YYYY-MM-DD format
      const date = new Date(value + "T00:00:00");
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch {
      // Invalid date
    }
    return undefined;
  }, [value]);

  // Update input value when value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(formatDateToVietnamese(value));
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      onChange(formatted);
      setInputValue(formatDateToVietnamese(formatted));
      setIsManualInput(false);
      setOpen(false);
    } else {
      onChange("");
      setInputValue("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setIsManualInput(true);

    // Auto-format: add slashes
    value = value.replace(/[^\d]/g, "");
    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (value.length > 5) {
      value = value.slice(0, 5) + "/" + value.slice(5, 9);
    }

    setInputValue(value);

    // Try to parse and update if valid
    const parsed = parseVietnameseDate(value);
    if (parsed) {
      onChange(parsed);
    } else if (value === "") {
      onChange("");
    }
  };

  const handleInputBlur = () => {
    // Validate and format on blur
    const parsed = parseVietnameseDate(inputValue);
    if (parsed) {
      onChange(parsed);
      setInputValue(formatDateToVietnamese(parsed));
    } else if (inputValue) {
      // Invalid date, try to keep valid part or clear
      const cleaned = inputValue.replace(/[^\d\/]/g, "");
      if (cleaned.length >= 5) {
        // Try to parse partial date
        const partialParsed = parseVietnameseDate(cleaned);
        if (partialParsed) {
          onChange(partialParsed);
          setInputValue(formatDateToVietnamese(partialParsed));
        } else {
          // Invalid, revert to last valid value
          if (value) {
            setInputValue(formatDateToVietnamese(value));
          } else {
            setInputValue("");
            onChange("");
          }
        }
      } else {
        // Too short, clear
        setInputValue("");
        onChange("");
      }
    }
  };

  return (
    <div className={cn("flex gap-1", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-10 w-[50px] justify-center p-0",
              !dateValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleCalendarSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setIsManualInput(true)}
        maxLength={10}
        disabled={disabled}
        className="flex-1"
      />
    </div>
  );
}


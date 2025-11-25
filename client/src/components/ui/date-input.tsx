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
import { formatDateToVietnamese, parseVietnameseDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  value?: string; // YYYY-MM-DD format (for API)
  onChange?: (value: string) => void; // Returns YYYY-MM-DD format
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
}

/**
 * DateInput component that accepts dd/mm/yyyy format
 * Includes calendar picker button and text input
 * Internally converts to/from yyyy-mm-dd for API compatibility
 * Based on DatePicker component pattern from ContractForm
 */
const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      value,
      onChange,
      placeholder = "dd/mm/yyyy",
      disabled,
      maxDate,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const isCalendarButtonClickRef = React.useRef(false);

    // Forward ref to input element
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Convert YYYY-MM-DD to Date object for calendar
    const dateValue = React.useMemo(() => {
      if (!value) return undefined;
      try {
        const date = new Date(value + "T00:00:00");
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch {
        // Invalid date
      }
      return undefined;
    }, [value]);

    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    React.useEffect(() => {
      if (value) {
        const formatted = formatDateToVietnamese(value);
        setDisplayValue(formatted);
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow typing dd/mm/yyyy format
      let cleaned = inputValue.replace(/[^\d\/]/g, "");

      // Auto-format while typing
      if (cleaned.length > 2 && !cleaned.includes("/")) {
        cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
      }
      if (cleaned.length > 5 && cleaned.split("/").length === 2) {
        cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5, 9);
      }

      // Limit to dd/mm/yyyy format
      if (cleaned.length > 10) {
        cleaned = cleaned.slice(0, 10);
      }

      setDisplayValue(cleaned);

      // Try to parse and call onChange if valid
      const parsed = parseVietnameseDate(cleaned);
      if (parsed && onChange) {
        onChange(parsed);
      } else if (!cleaned && onChange) {
        // Allow clearing the value
        onChange("");
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Don't trigger blur if calendar popover is open (user clicked calendar button)
      // Check if the related target is within the popover
      const relatedTarget = e.relatedTarget as HTMLElement;
      const isClickingCalendar =
        relatedTarget?.closest('[role="dialog"]') ||
        relatedTarget?.closest("[data-radix-popper-content-wrapper]") ||
        document.activeElement?.closest('[role="dialog"]') ||
        document.activeElement?.closest("[data-radix-popper-content-wrapper]");

      // If calendar button was just clicked, don't trigger blur save
      if (isCalendarButtonClickRef.current) {
        isCalendarButtonClickRef.current = false;
        return;
      }

      if (open || isClickingCalendar) {
        // Calendar is open or user is interacting with calendar, don't trigger blur
        return;
      }

      // Validate and format on blur
      if (displayValue) {
        const parsed = parseVietnameseDate(displayValue);
        if (parsed) {
          const formatted = formatDateToVietnamese(parsed);
          setDisplayValue(formatted);
          if (onChange && parsed !== value) {
            onChange(parsed);
          }
        } else {
          // Invalid date, revert to last valid value
          if (value) {
            setDisplayValue(formatDateToVietnamese(value));
          } else {
            setDisplayValue("");
            if (onChange) {
              onChange("");
            }
          }
        }
      }

      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      props.onFocus?.(e);
    };

    // Track if this is the first selection after opening (to ignore initial Calendar onSelect call)
    const isFirstSelectionRef = React.useRef(true);

    const handleCalendarSelect = (date: Date | undefined) => {
      // Check if this is the first call when calendar opens
      if (isFirstSelectionRef.current) {
        isFirstSelectionRef.current = false;

        // Only ignore if the selected date is the same as current value
        // (this is Calendar component auto-selecting the current value)
        if (date) {
          const formatted = format(date, "yyyy-MM-dd");
          if (formatted === value) {
            // Same as current value, ignore this auto-selection
            return;
          }
          // Different date selected by user, process it
        } else {
          // User cleared selection on first click, process it
        }
      }

      // Process the selection
      if (date) {
        const formatted = format(date, "yyyy-MM-dd");
        // Only update if different from current value
        if (formatted !== value) {
          onChange?.(formatted);
        }
        setDisplayValue(formatDateToVietnamese(formatted));
        setOpen(false);
      } else {
        // Clear selection
        onChange?.("");
        setDisplayValue("");
        setOpen(false);
      }
    };

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      // Reset flag when opening calendar
      if (newOpen) {
        isFirstSelectionRef.current = true;
      } else {
        // Reset calendar button click flag when closing
        isCalendarButtonClickRef.current = false;
      }
    };

    // Extract height classes from className if provided (for inline editing)
    const heightClasses = className?.match(/h-\d+/g) || [];
    const buttonHeightClass =
      heightClasses.length > 0 ? heightClasses[0] : "h-10";
    // Remove height classes from input className to avoid conflicts
    const inputClassName = className?.replace(/h-\d+/g, "").trim() || "";

    // Prevent onClick from being passed to Input to avoid conflicts
    const { onClick, ...inputProps } = props;

    return (
      <div
        className="flex gap-1 min-w-[170px]"
        onClick={(e) => e.stopPropagation()}>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                `${buttonHeightClass} w-[50px] justify-center p-0 flex-shrink-0`,
                !dateValue && "text-muted-foreground"
              )}
              disabled={disabled}
              onMouseDown={(e) => {
                // Mark that calendar button is being clicked to prevent blur save
                isCalendarButtonClickRef.current = true;
                // Prevent input from losing focus immediately
                e.preventDefault();
              }}
              onClick={(e) => {
                // Ensure the flag is set
                isCalendarButtonClickRef.current = true;
              }}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            onClick={(e) => e.stopPropagation()}>
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleCalendarSelect}
              max={maxDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          {...inputProps}
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("flex-1 min-w-[120px]", inputClassName)}
          inputMode="numeric"
          maxLength={10}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(e as any);
          }}
        />
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export { DateInput };

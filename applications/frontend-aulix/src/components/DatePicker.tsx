import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /**
   * "birth": the last 100 years, no future dates, and opens on a typical birth year.
   * "event": hire/enrollment dates, the last 50 years up to next year.
   */
  kind?: "birth" | "event";
  /** Year the calendar opens on when no date is selected yet (birth dates only). */
  defaultYear?: number;
  "aria-invalid"?: boolean;
}

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  kind = "event",
  defaultYear,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const thisYear = today.getFullYear();
  const isBirth = kind === "birth";

  // Month/year dropdowns in the caption only list months inside this range.
  const startMonth = new Date(thisYear - (isBirth ? 100 : 50), 0);
  const endMonth = isBirth ? today : new Date(thisYear + 1, 11);

  const openOn =
    value ?? (isBirth && defaultYear ? new Date(defaultYear, 0) : today);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          defaultMonth={openOn}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={isBirth ? { after: today } : undefined}
          onSelect={(date) => {
            onChange(date);
            if (date) setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

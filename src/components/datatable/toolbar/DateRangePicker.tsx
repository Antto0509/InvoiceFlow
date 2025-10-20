"use client";

import * as React from "react";
import { fr } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateRangeValue = { from?: string | Date; to?: string | Date };

/**
 * Convert a string or Date to a Date object or undefined.
 * @param v The value to convert.
 * @returns A Date object or undefined.
 */
function toDateOrU(v?: string | Date) {
  if (!v) return undefined;
  if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v;
  const [y, m, d] = String(v).split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/**
 * Convert a Date object to an ISO 8601 string in local time.
 * @param d The Date object to convert.
 * @returns An ISO 8601 string in local time or undefined.
 */
function toIsoLocal(d?: Date) {
  if (!d) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Sélectionner une période",
}: {
  value?: DateRangeValue;
  onChange?: (v?: { from?: string; to?: string }) => void;
  placeholder?: string;
}) {
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);

  React.useEffect(() => {
    setRange(
      value ? { from: toDateOrU(value.from), to: toDateOrU(value.to) } : undefined
    );
  }, [value]);

  const buttonLabel =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString("fr-FR")} - ${range.to.toLocaleDateString("fr-FR")}`
      : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-56 justify-between font-normal">
          {buttonLabel}
          <ChevronDownIcon className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          locale={fr}
          selected={range}
          captionLayout="dropdown"
          onSelect={(next) => {
            setRange(next);
            onChange?.({ from: toIsoLocal(next?.from), to: toIsoLocal(next?.to) });
          }}
          className="w-80"
        />
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { SelectMenu } from "@/components/ui/select-menu";

type Precision = "day" | "month" | "year";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function parseDateValue(value: string) {
  const today = new Date();
  const fallbackYear = today.getFullYear();
  const parts = value.split("-");
  return {
    year: Number(parts[0]) || fallbackYear,
    month: Number(parts[1]) || today.getMonth() + 1,
    day: Number(parts[2]) || today.getDate(),
  };
}

export function DatePartsSelector({
  value,
  precision,
  onChange,
  startYear = 1900,
}: {
  value: string;
  precision: Precision;
  onChange: (value: string) => void;
  startYear?: number;
}) {
  const currentYear = new Date().getFullYear();
  const parsed = parseDateValue(value);
  const yearStart = Math.min(startYear, parsed.year);
  const yearEnd = Math.max(currentYear + 1, parsed.year);
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, index) => {
    const year = yearEnd - index;
    return { value: String(year), label: String(year) };
  });
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { value: pad(month), label: `${month}月` };
  });
  const maxDay = daysInMonth(parsed.year, parsed.month);
  const safeDay = Math.min(parsed.day, maxDay);
  const days = Array.from({ length: maxDay }, (_, index) => {
    const day = index + 1;
    return { value: pad(day), label: `${day}日` };
  });

  const update = (next: Partial<typeof parsed>) => {
    const year = next.year ?? parsed.year;
    const month = next.month ?? parsed.month;
    const day = Math.min(next.day ?? safeDay, daysInMonth(year, month));

    if (precision === "year") onChange(String(year));
    else if (precision === "month") onChange(`${year}-${pad(month)}`);
    else onChange(`${year}-${pad(month)}-${pad(day)}`);
  };

  return (
    <div
      className={
        precision === "day"
          ? "grid grid-cols-3 gap-2"
          : precision === "month"
            ? "grid grid-cols-2 gap-2"
            : "grid grid-cols-1"
      }
    >
      <SelectMenu
        value={String(parsed.year)}
        onValueChange={(next) => update({ year: Number(next) })}
        options={years}
        ariaLabel="选择年份"
      />
      {precision !== "year" && (
        <SelectMenu
          value={pad(parsed.month)}
          onValueChange={(next) => update({ month: Number(next) })}
          options={months}
          ariaLabel="选择月份"
        />
      )}
      {precision === "day" && (
        <SelectMenu
          value={pad(safeDay)}
          onValueChange={(next) => update({ day: Number(next) })}
          options={days}
          ariaLabel="选择日期"
        />
      )}
    </div>
  );
}

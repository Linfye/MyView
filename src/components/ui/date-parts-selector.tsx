"use client";

type Precision = "day" | "month" | "year";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function parseDateValue(value: string) {
  const today = new Date();
  const parts = value.split("-");
  return {
    year: clamp(Number(parts[0]) || today.getFullYear(), 1, 9999),
    month: clamp(Number(parts[1]) || today.getMonth() + 1, 1, 12),
    day: clamp(Number(parts[2]) || today.getDate(), 1, 31),
  };
}

function NumberPartInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        className="field-control h-10 w-full"
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
      />
    </label>
  );
}

export function DatePartsSelector({
  value,
  precision,
  onChange,
}: {
  value: string;
  precision: Precision;
  onChange: (value: string) => void;
  startYear?: number;
}) {
  const parsed = parseDateValue(value);
  const safeDay = Math.min(parsed.day, daysInMonth(parsed.year, parsed.month));

  const update = (next: Partial<typeof parsed>) => {
    const year = clamp(next.year ?? parsed.year, 1, 9999);
    const month = clamp(next.month ?? parsed.month, 1, 12);
    const day = clamp(
      next.day ?? safeDay,
      1,
      daysInMonth(year, month),
    );

    if (precision === "year") onChange(String(year));
    else if (precision === "month") onChange(`${year}-${pad(month)}`);
    else onChange(`${year}-${pad(month)}-${pad(day)}`);
  };

  return (
    <div
      className={
        precision === "day"
          ? "grid grid-cols-3 gap-3"
          : precision === "month"
            ? "grid grid-cols-2 gap-3"
            : "grid grid-cols-1"
      }
    >
      <NumberPartInput
        label="年份"
        value={parsed.year}
        min={1}
        max={9999}
        onChange={(year) => update({ year })}
      />
      {precision !== "year" && (
        <NumberPartInput
          label="月份"
          value={parsed.month}
          min={1}
          max={12}
          onChange={(month) => update({ month })}
        />
      )}
      {precision === "day" && (
        <NumberPartInput
          label="日期"
          value={safeDay}
          min={1}
          max={daysInMonth(parsed.year, parsed.month)}
          onChange={(day) => update({ day })}
        />
      )}
    </div>
  );
}

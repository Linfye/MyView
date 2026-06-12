"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
};

export function SelectMenu({
  value,
  onValueChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition-colors hover:border-teal-200 hover:bg-teal-50/40 focus:border-teal-300 focus:ring-3 focus:ring-teal-100 data-[placeholder]:text-slate-400",
          className,
        )}
      >
        <Select.Value />
        <Select.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="z-[140] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="relative flex h-9 cursor-pointer select-none items-center rounded-lg px-8 text-slate-600 outline-none transition-colors data-[highlighted]:bg-teal-50 data-[highlighted]:text-teal-800 data-[state=checked]:font-semibold data-[state=checked]:text-teal-800"
              >
                <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check className="size-4" />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

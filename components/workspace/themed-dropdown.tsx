"use client";

import React from "react";

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

export function ThemedDropdown<T extends string>({
  value,
  options,
  ariaLabel,
  buttonClassName,
  menuClassName,
  onSelect,
  disabled = false,
}: {
  value: T;
  options: Array<DropdownOption<T>>;
  ariaLabel: string;
  buttonClassName: string;
  menuClassName?: string;
  onSelect: (value: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label ?? "";

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        className={`${buttonClassName} flex items-center justify-between text-left disabled:cursor-not-allowed disabled:opacity-70`}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div
          className={`absolute z-20 mt-2 max-h-80 w-full overflow-hidden rounded-xl border border-[#d4901e]/30 bg-[#161616] shadow-[0_14px_36px_rgba(0,0,0,0.45)] ${menuClassName ?? ""}`}
        >
          <div role="listbox" aria-label={`${ariaLabel} options`} className="max-h-80 overflow-y-auto py-1.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-[#d4901e]/18 text-[#faf9f7]"
                      : "text-[#faf9f7] hover:bg-white/[0.06]"
                  }`}
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {isSelected ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#d4901e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

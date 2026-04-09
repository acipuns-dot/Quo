import React from "react";

export type CustomerOption = {
  id: string;
  name: string;
  address: string;
};

type CustomerAutosuggestProps = {
  query: string;
  options: CustomerOption[];
  onPick: (option: CustomerOption) => void;
};

export function CustomerAutosuggest({
  query,
  options,
  onPick,
}: CustomerAutosuggestProps) {
  if (!query.trim() || options.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#e7e5e4] bg-white shadow-sm">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onPick(option)}
          className="block w-full border-b border-[#f5f5f4] px-3 py-2 text-left text-sm last:border-b-0 hover:bg-[#fafaf9]"
        >
          <div className="font-medium text-[#1c1917]">{option.name}</div>
          <div className="text-xs text-[#78716c]">{option.address}</div>
        </button>
      ))}
    </div>
  );
}

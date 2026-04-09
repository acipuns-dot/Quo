"use client";

import React from "react";
import type { TemplateDefinition } from "../../lib/documents/templates";

type TemplatePickerProps = {
  templates: TemplateDefinition[];
  selectedId: string;
  onChange: (templateId: string) => void;
};

export function TemplatePicker({
  templates,
  selectedId,
  onChange,
}: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
        Style
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedId === template.id
                ? "border-stone-800 bg-white shadow-sm ring-1 ring-stone-800/20"
                : "border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white"
            }`}
          >
            <div className="font-semibold text-stone-900">{template.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

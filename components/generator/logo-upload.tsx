"use client";

import Image from "next/image";
import React from "react";

type LogoUploadProps = {
  error?: string | null;
  value: string | null;
  onChange: (value: string | null) => void;
  onErrorChange: (value: string | null) => void;
};

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/svg+xml",
]);

const VALIDATION_MESSAGE = "Upload a PNG, JPG, or SVG logo under 2 MB.";

export function LogoUpload({
  error,
  value,
  onChange,
  onErrorChange,
}: LogoUploadProps) {
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      onErrorChange(null);
      onChange(null);
      return;
    }

    if (
      !ACCEPTED_MIME_TYPES.has(file.type) ||
      file.size > MAX_FILE_SIZE_BYTES
    ) {
      onErrorChange(VALIDATION_MESSAGE);
      onChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onErrorChange(null);
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <input
        aria-label="Upload logo"
        type="file"
        accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
        className="block w-full text-sm text-white/35 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#d4901e]/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#d4901e] hover:file:bg-[#d4901e]/20"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
            Logo preview
          </p>
          <Image
            src={value}
            alt="Uploaded logo preview"
            className="max-h-16 w-auto object-contain"
            width={160}
            height={64}
            unoptimized
          />
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

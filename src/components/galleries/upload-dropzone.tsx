"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { PHOTO_UPLOAD_CONFIG } from "@/lib/photos/config";
import { cn } from "@/lib/utils/cn";

export function UploadDropzone({ disabled, onFilesSelected }: { disabled?: boolean; onFilesSelected: (files: File[]) => void }) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const choose = (files: FileList | null) => { if (files?.length) onFilesSelected(Array.from(files)); };
  return <div
    className={cn("rounded-card border border-dashed border-border bg-surface-muted p-8 text-center transition-colors", dragging && "border-accent bg-surface", disabled && "opacity-60")}
    onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
    onDragOver={(event) => event.preventDefault()}
    onDragLeave={() => setDragging(false)}
    onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) choose(event.dataTransfer.files); }}
  >
    <ImagePlus className="mx-auto text-muted-foreground" size={28} aria-hidden="true" />
    <p className="mt-4 font-semibold">Drop photographs here</p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">JPEG, PNG, or WebP · up to 25 MB each · {PHOTO_UPLOAD_CONFIG.maxFilesPerBatch} at a time</p>
    <input ref={input} id={inputId} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={(event) => { choose(event.target.files); event.currentTarget.value = ""; }} />
    <label htmlFor={inputId} className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-control border border-input bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-within:outline-3 focus-within:outline-ring focus-within:outline-offset-2">Choose photographs</label>
  </div>;
}

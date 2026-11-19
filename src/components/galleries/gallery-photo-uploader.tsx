"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadDropzone } from "@/components/galleries/upload-dropzone";
import { PHOTO_UPLOAD_CONFIG } from "@/lib/photos/config";
import { hasExpectedFileExtension, mimeTypeFromImageSignature } from "@/lib/validation/photo";

type Status = "queued" | "uploading" | "processing" | "ready" | "failed";
type QueueItem = { localId: string; file: File; preview: string; status: Status; progress: number; photoId?: string; error?: string; previewUrl?: string };

export function GalleryPhotoUploader({
  galleryId,
  onUploadComplete,
}: {
  galleryId: string;
  onUploadComplete?: () => void;
}) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const running = useRef(0);
  const itemsRef = useRef(items);
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);
  const update = (localId: string, patch: Partial<QueueItem>) => {
    itemsRef.current = itemsRef.current.map((item) => item.localId === localId ? { ...item, ...patch } : item);
    setItems(itemsRef.current);
  };
  const processNext = () => {
    while (running.current < PHOTO_UPLOAD_CONFIG.maxConcurrentUploads) {
      const next = itemsRef.current.find((item) => item.status === "queued");
      if (!next) return;
      running.current += 1; update(next.localId, { status: "uploading", progress: 0 });
      upload(next).finally(() => { running.current -= 1; processNext(); });
    }
  };
  const addFiles = async (files: File[]) => {
    const chosen = files.slice(0, PHOTO_UPLOAD_CONFIG.maxFilesPerBatch);
    const rejected = files.slice(PHOTO_UPLOAD_CONFIG.maxFilesPerBatch).map((file) => failedItem(file, `Choose no more than ${PHOTO_UPLOAD_CONFIG.maxFilesPerBatch} photographs at once.`));
    const accepted: QueueItem[] = [];
    for (const file of chosen) accepted.push(await validateClientFile(file));
    itemsRef.current = [...itemsRef.current, ...accepted, ...rejected];
    setItems(itemsRef.current);
    queueMicrotask(processNext);
  };
  const upload = async (item: QueueItem) => {
    try {
      const intent = await fetch(`/api/galleries/${galleryId}/photos/upload-intent`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileName: item.file.name, mimeType: item.file.type, fileSizeBytes: item.file.size }) });
      const intentBody = await intent.json(); if (!intent.ok) throw new Error(intentBody.error ?? "We could not prepare this upload.");
      update(item.localId, { photoId: intentBody.photoId });
      await uploadWithProgress(intentBody.uploadUrl, item.file, (progress) => update(item.localId, { progress }));
      update(item.localId, { status: "processing", progress: 100 });
      const complete = await fetch(`/api/galleries/${galleryId}/photos/${intentBody.photoId}/complete`, { method: "POST" });
      const completeBody = await complete.json(); if (!complete.ok) throw new Error(completeBody.error ?? "Processing failed.");
      update(item.localId, { status: "ready", previewUrl: completeBody.previewUrl });
      onUploadComplete?.();
    } catch (error) { update(item.localId, { status: "failed", error: error instanceof Error ? error.message : "This upload failed." }); }
  };
  const retry = async (item: QueueItem) => {
    if (!item.photoId) { update(item.localId, { status: "queued", error: undefined, progress: 0 }); queueMicrotask(processNext); return; }
    update(item.localId, { status: "processing", error: undefined });
    const response = await fetch(`/api/galleries/${galleryId}/photos/${item.photoId}/retry`, { method: "POST" });
    const body = await response.json();
    update(item.localId, response.ok ? { status: "ready", previewUrl: body.previewUrl } : { status: "failed", error: body.error ?? "Processing failed." });
    if (response.ok) onUploadComplete?.();
  };
  const remove = async (item: QueueItem) => {
    if (item.photoId) await fetch(`/api/galleries/${galleryId}/photos/${item.photoId}`, { method: "DELETE" });
    URL.revokeObjectURL(item.preview); itemsRef.current = itemsRef.current.filter((candidate) => candidate.localId !== item.localId); setItems(itemsRef.current);
  };
  const summary = ["ready", "processing", "uploading", "failed"].map((status) => ({ status, count: items.filter((item) => item.status === status).length })).filter(({ count }) => count).map(({ status, count }) => `${count} ${status}`).join(" · ");
  return <Card className="mt-10 max-w-3xl"><CardContent><h2 className="text-lg font-semibold">Add photographs</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Originals remain private. We generate metadata-free preview images after upload.</p><div className="mt-6"><UploadDropzone onFilesSelected={addFiles} /></div>{summary ? <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">{summary}</p> : null}<ul className="mt-5 space-y-3" aria-label="Upload queue">{items.map((item) => <li key={item.localId} className="flex gap-3 rounded-control border border-border p-3"><Image className="size-14 rounded-control bg-surface-muted object-cover" src={item.previewUrl ?? item.preview} alt="" width={56} height={56} unoptimized /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="truncate text-sm font-medium">{item.file.name}</p><span className="text-xs capitalize text-muted-foreground">{item.status}</span></div>{item.status === "uploading" ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-accent transition-[width]" style={{ width: `${item.progress}%` }} /></div> : null}{item.error ? <p className="mt-1 text-xs text-destructive">{item.error}</p> : null}</div><div className="flex shrink-0 gap-1">{item.status === "failed" ? <Button size="small" variant="outline" onClick={() => retry(item)}>Retry</Button> : null}<Button size="small" variant="ghost" aria-label={`Remove ${item.file.name}`} onClick={() => remove(item)}>Remove</Button></div></li>)}</ul>{items.some((item) => item.status === "failed") ? <Alert tone="error" className="mt-5">Failed items can be retried or removed. Successful photographs stay in this draft.</Alert> : null}</CardContent></Card>;
}

async function validateClientFile(file: File): Promise<QueueItem> {
  if (!PHOTO_UPLOAD_CONFIG.acceptedMimeTypes.includes(file.type as (typeof PHOTO_UPLOAD_CONFIG.acceptedMimeTypes)[number]) || file.size === 0 || file.size > PHOTO_UPLOAD_CONFIG.maxBytes) return failedItem(file, "Use a JPEG, PNG, or WebP image smaller than 25 MB.");
  const signature = mimeTypeFromImageSignature(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!signature || signature !== file.type || !hasExpectedFileExtension(file.name, signature)) return failedItem(file, "The file name, type, and image signature must match.");
  return { localId: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: "queued", progress: 0 };
}
function failedItem(file: File, error: string): QueueItem { return { localId: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: "failed", progress: 0, error }; }
function uploadWithProgress(url: string, file: File, onProgress: (progress: number) => void) { return new Promise<void>((resolve, reject) => { const request = new XMLHttpRequest(); request.open("PUT", url); request.setRequestHeader("content-type", file.type); request.setRequestHeader("x-upsert", "false"); request.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); }; request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("The upload did not complete.")); request.onerror = () => reject(new Error("The upload connection failed.")); request.onabort = () => reject(new Error("The upload was cancelled.")); request.send(file); }); }

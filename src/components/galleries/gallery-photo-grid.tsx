"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, GripVertical, ImageOff, Images, Pencil, RotateCcw, Star, Trash2 } from "lucide-react";
import { GalleryPhotoUploader } from "@/components/galleries/gallery-photo-uploader";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import { type GalleryPhoto } from "@/lib/photos/repository";

export function GalleryPhotoGrid({ galleryId, initialPhotos, coverPhotoId }: { galleryId: string; initialPhotos: GalleryPhoto[]; coverPhotoId: string | null }) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [coverId, setCoverId] = useState(coverPhotoId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);

  const selectedPhotos = photos.filter((photo) => selected.has(photo.id));

  function toggleSelection(photoId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }

  async function persistOrder(next: GalleryPhoto[]) {
    setIsOrdering(true); setError(null);
    const previous = photos; setPhotos(next);
    const response = await fetch(`/api/galleries/${galleryId}/photos/reorder`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ photoIds: next.map((photo) => photo.id) }) });
    if (!response.ok) { const body = await response.json(); setPhotos(previous); setError(body.error ?? "We could not save the photo order."); }
    else {
      // The grid is already in the persisted order locally. Avoiding a full
      // route refresh keeps signed thumbnail URLs and image elements stable,
      // so a reorder does not visibly flicker or reload every photograph.
      setMessage("Photo order saved.");
    }
    setIsOrdering(false);
  }

  function movePhoto(photoId: string, direction: -1 | 1) {
    const index = photos.findIndex((photo) => photo.id === photoId); const target = index + direction;
    if (index < 0 || target < 0 || target >= photos.length || isOrdering) return;
    const next = [...photos]; [next[index], next[target]] = [next[target], next[index]]; void persistOrder(next);
  }

  async function setCover(photoId: string) {
    setError(null); const response = await fetch(`/api/galleries/${galleryId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "set-cover", photoId }) });
    const body = await response.json();
    if (!response.ok) return setError(body.error ?? "We could not update the cover photograph.");
    setCoverId(photoId); setMessage("Cover photograph selected."); router.refresh();
  }

  async function retryPhoto(photoId: string) {
    setError(null); const response = await fetch(`/api/galleries/${galleryId}/photos/${photoId}/retry`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) return setError(body.error ?? "We could not retry this photograph.");
    setMessage("Photograph processed."); router.refresh();
  }

  async function deleteSelected() {
    setError(null); const results = await Promise.all(selectedPhotos.map((photo) => fetch(`/api/galleries/${galleryId}/photos/${photo.id}`, { method: "DELETE" })));
    if (results.some((result) => !result.ok)) { setError("Some photographs could not be removed. Please try again."); return; }
    setPhotos((current) => current.filter((photo) => !selected.has(photo.id))); setSelected(new Set()); setConfirmDelete(false); setMessage("Selected photographs removed."); router.refresh();
  }

  async function saveMetadata(formData: FormData) {
    if (!editing) return;
    const response = await fetch(`/api/galleries/${galleryId}/photos/${editing.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ altText: formData.get("altText"), caption: formData.get("caption") }) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "We could not save the photo details."); return; }
    setPhotos((current) => current.map((photo) => photo.id === editing.id ? { ...photo, alt_text: String(formData.get("altText") || "") || null, caption: String(formData.get("caption") || "") || null } : photo)); setEditing(null); setMessage("Photo details saved.");
  }

  if (photos.length === 0) return <div className="mt-10"><EmptyState icon={Images} title="No photographs yet" description="Add photographs to this private draft. Preview images are prepared before they appear here." action={<a className="text-sm font-semibold text-accent-strong underline-offset-4 hover:underline" href="#upload-photos">Upload photos</a>} /><div id="upload-photos"><GalleryPhotoUploader galleryId={galleryId} onUploadComplete={() => router.refresh()} /></div></div>;

  return <section className="mt-8" aria-labelledby="photos-heading">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="photos-heading" className="text-xl font-semibold">Photos</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Drag a photograph to reorder it, or use the arrow controls when working with a keyboard.</p></div><Badge>{photos.filter((photo) => photo.processing_status === "ready").length} ready</Badge></div>
    {selected.size > 0 ? <div className="mt-5 flex flex-wrap items-center gap-3 rounded-control border border-border bg-surface-muted p-3"><p className="text-sm font-medium">{selected.size} selected</p><Button size="small" variant="ghost" onClick={() => setSelected(new Set())}>Deselect</Button>{selectedPhotos.length === 1 && selectedPhotos[0].processing_status === "ready" ? <Button size="small" variant="outline" onClick={() => void setCover(selectedPhotos[0].id)}><Star size={16} aria-hidden="true" /> Set cover</Button> : null}{selectedPhotos.length === 1 ? <Button size="small" variant="outline" onClick={() => setEditing(selectedPhotos[0])}><Pencil size={16} aria-hidden="true" /> Edit details</Button> : null}<Button size="small" variant="destructive" onClick={() => setConfirmDelete(true)}><Trash2 size={16} aria-hidden="true" /> Remove</Button></div> : null}
    {confirmDelete ? <Alert tone="error" className="mt-5"><div className="w-full"><p>Remove {selected.size} selected photograph{selected.size === 1 ? "" : "s"}? This permanently removes private originals and previews.</p><div className="mt-3 flex gap-3"><Button size="small" variant="destructive" onClick={() => void deleteSelected()}>Remove photographs</Button><Button size="small" variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button></div></div></Alert> : null}
    {error ? <Alert tone="error" className="mt-5">{error}</Alert> : null}{message ? <Toast message={message} onDismiss={() => setMessage(null)} /> : null}
    <div className="mt-6 grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{photos.map((photo, index) => <article key={photo.id} className="group relative overflow-hidden rounded-card border border-border bg-surface" draggable={!isOrdering} onDragStart={() => setDraggedId(photo.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!draggedId || draggedId === photo.id) return; const from = photos.findIndex((item) => item.id === draggedId); const to = photos.findIndex((item) => item.id === photo.id); const next = [...photos]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); void persistOrder(next); setDraggedId(null); }}><div className="relative bg-surface-muted">{photo.processing_status === "ready" && (photo.thumbnail_storage_path || photo.preview_storage_path) ? <Image src={`/api/galleries/${galleryId}/photos/${photo.id}/preview`} alt={photo.alt_text || `Photograph: ${photo.file_name}`} width={photo.width ?? 1200} height={photo.height ?? 800} unoptimized className="h-auto w-full" /> : <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground"><ImageOff size={28} aria-hidden="true" /></div>}<label className="absolute left-3 top-3 inline-flex size-9 cursor-pointer items-center justify-center rounded-control bg-surface/90"><input type="checkbox" className="size-4 accent-[var(--accent-strong)]" checked={selected.has(photo.id)} onChange={() => toggleSelection(photo.id)} aria-label={`Select ${photo.file_name}`} /></label>{coverId === photo.id ? <Badge className="absolute right-3 top-3 bg-foreground text-white">Cover</Badge> : null}</div><div className="flex items-start gap-2 p-3"><span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-control text-muted-foreground transition-colors group-hover:bg-surface-muted group-focus-within:bg-surface-muted" aria-hidden="true"><GripVertical size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{photo.file_name}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{photo.processing_status}{photo.processing_error_message ? ` · ${photo.processing_error_message}` : ""}</p></div></div><div className="flex items-center justify-between border-t border-border px-3 py-2"><div className="flex items-center gap-1" aria-label={`Reorder ${photo.file_name}`}><Button size="icon" variant="ghost" className="size-10" disabled={index === 0 || isOrdering} aria-label={`Move ${photo.file_name} earlier`} title="Move earlier" onClick={() => movePhoto(photo.id, -1)}><ChevronLeft size={18} aria-hidden="true" /></Button><Button size="icon" variant="ghost" className="size-10" disabled={index === photos.length - 1 || isOrdering} aria-label={`Move ${photo.file_name} later`} title="Move later" onClick={() => movePhoto(photo.id, 1)}><ChevronRight size={18} aria-hidden="true" /></Button></div>{photo.processing_status === "failed" ? <Button size="small" variant="ghost" onClick={() => void retryPhoto(photo.id)}><RotateCcw size={15} aria-hidden="true" /> Retry</Button> : <span className="text-xs text-muted-foreground">{index + 1}</span>}</div></article>)}</div>
    {editing ? <form action={saveMetadata} className="mt-8 max-w-xl rounded-card border border-border bg-surface p-6"><h3 className="text-lg font-semibold">Edit photo details</h3><p className="mt-2 text-sm text-muted-foreground">These details support accessible viewing and future client galleries.</p><div className="mt-5"><Label htmlFor="altText">Alternative text <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="altText" name="altText" defaultValue={editing.alt_text ?? ""} maxLength={500} /></div><div className="mt-5"><Label htmlFor="caption">Caption <span className="font-normal text-muted-foreground">(optional)</span></Label><Textarea id="caption" name="caption" defaultValue={editing.caption ?? ""} maxLength={1000} /></div><div className="mt-6 flex gap-3"><Button type="submit">Save photo details</Button><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button></div></form> : null}
    <div id="upload-photos"><GalleryPhotoUploader galleryId={galleryId} onUploadComplete={() => router.refresh()} /></div>
  </section>;
}

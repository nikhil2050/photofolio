"use client";

import { useState } from "react";
import { Archive, Copy, Link2, LockKeyhole, RotateCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelperText, Label } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import type { GallerySharingState, PublishReadiness } from "@/lib/galleries/repository";
import type { AccessMode } from "@/lib/validation/gallery-sharing";

export function GallerySharePanel({ galleryId, initialState, readiness }: { galleryId: string; initialState: GallerySharingState; readiness: PublishReadiness }) {
  const [state, setState] = useState(initialState);
  const [accessMode, setAccessMode] = useState<AccessMode>(initialState.accessMode);
  const [password, setPassword] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"unpublish" | "archive" | null>(null);

  async function perform(action: "publish" | "update-access" | "rotate-link" | "unpublish" | "archive") {
    setError(null); setPending(action);
    try {
      const response = await fetch(`/api/galleries/${galleryId}/sharing`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "publish" || action === "update-access" ? { action, accessMode, password: password || undefined } : { action }),
      });
      const body = await response.json();
      if (!response.ok) { 
        setError(body.error ?? "We could not update sharing."); 
        return; 
      }

      if (body.shareUrl) 
        setShareUrl(body.shareUrl);

      if (action === "publish") { 
        setState((current) => ({ 
          ...current, status: "published", accessMode, hasShareLink: true 
        })); 
        setMessage("Gallery published. Share the new private link with your client."); 
      }

      if (action === "update-access") { 
        setState((current) => ({ 
          ...current, accessMode })); setPassword(""); 
          setMessage("Sharing access saved."); 
      }

      if (action === "rotate-link") { 
        setMessage("A new share link is ready. The previous link no longer works."); 
      }

      if (action === "unpublish") { 
        setState((current) => ({ 
          ...current, status: "draft" 
        })); 
        setShareUrl(null); 
        setMessage("Sharing disabled. The gallery is private again."); 
      }

      if (action === "archive") { 
        setState((current) => ({ 
          ...current, status: "archived", hasShareLink: false 
        })); 
        setShareUrl(null); setMessage("Gallery archived and sharing disabled."); 
      }
      
      setConfirm(null);
    } catch { setError("We could not update sharing. Check your connection and try again."); }
    finally { setPending(null); }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try { await navigator.clipboard.writeText(shareUrl); setMessage("Share link copied."); }
    catch { setError("We could not copy the link. Select and copy it manually."); }
  }

  const isPublished = state.status === "published";
  const canEdit = state.status !== "archived";

  return <section id="sharing" className="mt-12 max-w-2xl" aria-labelledby="sharing-heading">
    <div className="rounded-card border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 id="sharing-heading" className="text-xl font-semibold">Sharing</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Control who can view this gallery. Share links are private and unlisted.</p></div><Badge className="bg-surface-muted text-foreground">{state.status}</Badge></div>
      {readiness.issues.length > 0 && !isPublished ? <Alert tone="info" className="mt-6"><div><p className="font-semibold">Before you publish</p><ul className="mt-2 list-disc space-y-1 pl-5">{readiness.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul></div></Alert> : null}
      {canEdit ? <fieldset className="mt-6"><legend className="text-sm font-semibold">Access</legend><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="flex cursor-pointer gap-3 rounded-control border border-border bg-surface p-4"><input type="radio" name="accessMode" checked={accessMode === "link"} onChange={() => setAccessMode("link")} /><span><span className="flex items-center gap-2 font-semibold"><Link2 size={17} aria-hidden="true" /> Anyone with the link</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Anyone you send the unlisted link to can view it.</span></span></label><label className="flex cursor-pointer gap-3 rounded-control border border-border bg-surface p-4"><input type="radio" name="accessMode" checked={accessMode === "password"} onChange={() => setAccessMode("password")} /><span><span className="flex items-center gap-2 font-semibold"><LockKeyhole size={17} aria-hidden="true" /> Password protected</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Clients need the link and a password.</span></span></label></div></fieldset> : null}
      {canEdit && accessMode === "password" ? <div className="mt-5"><Label htmlFor="gallery-password">Gallery password</Label><Input id="gallery-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" /><HelperText>Use at least 8 characters. The password is never shown again after saving.</HelperText></div> : null}
      {isPublished && canEdit ? <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" disabled={pending !== null} onClick={() => void perform("update-access")}>{pending === "update-access" ? "Saving…" : "Save access"}</Button><Button variant="outline" disabled={pending !== null} onClick={() => void perform("rotate-link")}><RotateCw size={17} aria-hidden="true" /> {pending === "rotate-link" ? "Rotating…" : "Rotate link"}</Button></div> : null}
      {!isPublished && canEdit ? <Button className="mt-6" disabled={!readiness.canPublish || pending !== null} onClick={() => void perform("publish")}>{pending === "publish" ? "Publishing…" : "Publish gallery"}</Button> : null}
      {shareUrl ? <div className="mt-6 rounded-control border border-border bg-surface-muted p-4"><Label htmlFor="share-link">Private share link</Label><div className="flex gap-2"><Input id="share-link" value={shareUrl} readOnly /><Button size="icon" variant="outline" aria-label="Copy share link" title="Copy share link" onClick={() => void copyLink()}><Copy size={17} aria-hidden="true" /></Button></div><HelperText>Copy this now. For security, existing links are not stored in readable form; rotate the link whenever you need a new one.</HelperText></div> : null}
      {isPublished && !shareUrl ? <Alert tone="info" className="mt-6">This gallery has an active private link. Rotate the link to create a new copyable link.</Alert> : null}
      {isPublished ? <div className="mt-8 border-t border-border pt-6"><p className="text-sm font-semibold">Danger zone</p>{confirm ? <Alert tone="error" className="mt-3"><div><p>{confirm === "unpublish" ? "Disable sharing? Anyone with the current link will no longer be able to view the gallery." : "Archive this gallery? Sharing will be disabled and the current link will be revoked."}</p><div className="mt-3 flex gap-3"><Button size="small" variant="destructive" disabled={pending !== null} onClick={() => void perform(confirm)}>{confirm === "unpublish" ? "Disable sharing" : "Archive gallery"}</Button><Button size="small" variant="outline" onClick={() => setConfirm(null)}>Cancel</Button></div></div></Alert> : <div className="mt-3 flex flex-wrap gap-3"><Button size="small" variant="outline" onClick={() => setConfirm("unpublish")}>Disable sharing</Button><Button size="small" variant="ghost" onClick={() => setConfirm("archive")}><Archive size={16} aria-hidden="true" /> Archive gallery</Button></div>}</div> : null}
      {error ? <Alert tone="error" className="mt-6">{error}</Alert> : null}{message ? <Toast message={message} onDismiss={() => setMessage(null)} /> : null}
    </div>
  </section>;
}

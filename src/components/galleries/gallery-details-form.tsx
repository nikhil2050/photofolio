"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HelperText, Label, ValidationMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Details = {
  title: string;
  clientName: string | null;
  description: string | null;
  eventDate: string | null;
  location: string | null;
};

type DetailField = "title" | "clientName" | "description" | "eventDate" | "location";
type FieldErrors = Partial<Record<DetailField, string>>;

export function GalleryDetailsForm({ galleryId, details }: { galleryId: string; details: Details }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function save(formData: FormData) {
    setStatus("saving");
    setMessage(""); setFieldErrors({});
    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          clientName: formData.get("clientName"),
          description: formData.get("description"),
          eventDate: formData.get("eventDate"),
          location: formData.get("location"),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        const nextErrors = Object.fromEntries(
          Object.entries(body.fieldErrors ?? {}).flatMap(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : undefined;
            return typeof message === "string" ? [[field, message]] : [];
          }),
        ) as FieldErrors;
        setFieldErrors(nextErrors); setStatus("error"); setMessage(body.error ?? "We could not save your changes.");
        return;
      }
      setStatus("saved"); setMessage("Gallery details saved.");
    } catch {
      setStatus("error"); setMessage("We could not save your changes. Check your connection and try again.");
    }
  }

  return (
    <form action={save} className="mt-6 max-w-2xl space-y-6" noValidate>
      <div>
        <Label htmlFor="title">Gallery title</Label>
        <Input id="title" name="title" defaultValue={details.title} required aria-invalid={Boolean(fieldErrors.title)} aria-describedby={fieldErrors.title ? "title-error" : undefined} />
        {fieldErrors.title ? <ValidationMessage id="title-error" className="mt-2">{fieldErrors.title}</ValidationMessage> : null}
      </div>
      <div>
        <Label htmlFor="clientName">Client or event name <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id="clientName" name="clientName" defaultValue={details.clientName ?? ""} aria-invalid={Boolean(fieldErrors.clientName)} aria-describedby={fieldErrors.clientName ? "client-name-error" : undefined} />
        {fieldErrors.clientName ? <ValidationMessage id="client-name-error" className="mt-2">{fieldErrors.clientName}</ValidationMessage> : null}
      </div>
      <div>
        <Label htmlFor="description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Textarea id="description" name="description" defaultValue={details.description ?? ""} maxLength={2000} aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "description-error" : undefined} />
        <HelperText>Give clients useful context for this delivery.</HelperText>
        {fieldErrors.description ? <ValidationMessage id="description-error" className="mt-2">{fieldErrors.description}</ValidationMessage> : null}
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div><Label htmlFor="eventDate">Event date <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="eventDate" name="eventDate" type="date" defaultValue={details.eventDate ?? ""} aria-invalid={Boolean(fieldErrors.eventDate)} aria-describedby={fieldErrors.eventDate ? "event-date-error" : undefined} />{fieldErrors.eventDate ? <ValidationMessage id="event-date-error" className="mt-2">{fieldErrors.eventDate}</ValidationMessage> : null}</div>
        <div><Label htmlFor="location">Location <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="location" name="location" defaultValue={details.location ?? ""} aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? "location-error" : undefined} />{fieldErrors.location ? <ValidationMessage id="location-error" className="mt-2">{fieldErrors.location}</ValidationMessage> : null}</div>
      </div>
      {status !== "idle" ? <Alert tone={status === "error" ? "error" : status === "saved" ? "success" : "info"}>{status === "saving" ? "Saving gallery details…" : message}</Alert> : null}
      <Button type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save details"}</Button>
    </form>
  );
}

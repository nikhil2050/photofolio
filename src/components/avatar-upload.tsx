"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HelperText, Label, ValidationMessage } from "@/components/ui/form";

export function AvatarUpload({
  initialPath,
  onChange,
}: {
  initialPath: string | null;
  onChange: (path: string, previewUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(initialPath ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    setStatus("uploading");
    setError("");
    const formData = new FormData();
    formData.set("image", file);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        path?: string;
        error?: string;
      };
      if (!response.ok || !result.path) {
        throw new Error(
          result.error ?? "Your logo could not be uploaded. Please try again.",
        );
      }
      setPath(result.path);
      onChange(result.path, URL.createObjectURL(file));
      setStatus("idle");
    } catch (uploadError) {
      setStatus("error");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Your logo could not be uploaded. Please try again.",
      );
    }
  }

  function remove() {
    setPath("");
    setError("");
    onChange("", null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input name="avatarPath" type="hidden" value={path} readOnly />
      <Label>
        Logo or profile photo{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      <div className="flex items-center gap-4">
        <Avatar initials={path ? "✓" : "PF"} />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
          >
            {status === "uploading" ? (
              <>
                <LoaderCircle
                  className="animate-spin"
                  size={17}
                  aria-hidden="true"
                />{" "}
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus size={17} aria-hidden="true" /> Choose image
              </>
            )}
          </Button>
          {path ? (
            <Button
              variant="ghost"
              type="button"
              onClick={remove}
              disabled={status === "uploading"}
            >
              <Trash2 size={17} aria-hidden="true" /> Remove
            </Button>
          ) : null}
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </div>
      </div>
      <HelperText>PNG, JPEG, or WebP; maximum 2 MB.</HelperText>
      {error ? (
        <ValidationMessage className="mt-3">{error}</ValidationMessage>
      ) : null}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function AvatarUpload({
  userId,
  initialPath,
}: {
  userId: string;
  initialPath: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(initialPath ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_AVATAR_BYTES) {
      setStatus("error");
      setError("Choose an image smaller than 2 MB.");
      return;
    }

    setStatus("uploading");
    setError("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const nextPath = `${userId}/profile/avatar-${crypto.randomUUID()}.${extension}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("preview-images")
      .upload(nextPath, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      setStatus("error");
      setError("Your logo could not be uploaded. Please try again.");
      return;
    }

    setPath(nextPath);
    setStatus("idle");
  }

  return (
    <div>
      <input name="avatarPath" type="hidden" value={path} readOnly />
      <p className="field-label">
        Studio logo or avatar{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </p>
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-[var(--accent-strong)]">
          {path ? "✓" : "PF"}
        </div>
        <div>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
          >
            {status === "uploading" ? (
              <>
                <LoaderCircle
                  className="mr-2 animate-spin"
                  size={17}
                  aria-hidden="true"
                />
                Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="mr-2" size={17} aria-hidden="true" />
                Choose image
              </>
            )}
          </button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => upload(event.target.files?.[0])}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPEG, or WebP; maximum 2 MB.
          </p>
        </div>
      </div>
      {error ? (
        <p className="form-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

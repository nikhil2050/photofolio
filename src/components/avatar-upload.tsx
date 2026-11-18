"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HelperText, Label, ValidationMessage } from "@/components/ui/form";

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
      <Label>
        Studio logo or avatar{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      <div className="flex items-center gap-4">
        <Avatar initials={path ? "✓" : "PF"} />
        <div>
          <Button
            variant="secondary"
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
          </Button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => upload(event.target.files?.[0])}
          />
          <HelperText>PNG, JPEG, or WebP; maximum 2 MB.</HelperText>
        </div>
      </div>
      {error ? (
        <ValidationMessage className="mt-3">{error}</ValidationMessage>
      ) : null}
    </div>
  );
}

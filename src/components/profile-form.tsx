"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { saveProfile, type ProfileFormState } from "@/app/actions/profile";
import { AvatarUpload } from "@/components/avatar-upload";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelperText, Label, ValidationMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PhotographerProfile } from "@/lib/profile/repository";

const initialState: ProfileFormState = {};

export function ProfileForm({
  profile,
}: {
  profile: PhotographerProfile | null;
}) {
  const [state, formAction, isPending] = useActionState(
    saveProfile,
    initialState,
  );
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bookingCtaLabel, setBookingCtaLabel] = useState(
    profile?.booking_cta_label ?? "Check availability",
  );
  const [avatarPath, setAvatarPath] = useState(profile?.avatar_path ?? "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const previewName = displayName.trim() || "Your studio name";

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <form action={formAction} className="space-y-6" noValidate>
        <AvatarUpload
          initialPath={profile?.avatar_path ?? null}
          onChange={(path, previewUrl) => {
            setAvatarPath(path);
            setAvatarPreviewUrl(previewUrl);
          }}
        />
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            autoComplete="organization"
            required
          />
          <HelperText>This will appear on future client galleries.</HelperText>
        </div>
        <div>
          <Label htmlFor="contactPhone">
            WhatsApp number{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            defaultValue={profile?.whatsapp_number ?? ""}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+491234567890"
          />
          <HelperText>Use international format, beginning with +.</HelperText>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="bookingCtaLabel">
              Booking button text{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="bookingCtaLabel"
              name="bookingCtaLabel"
              value={bookingCtaLabel}
              onChange={(event) => setBookingCtaLabel(event.target.value)}
              placeholder="Check availability"
            />
          </div>
          <div>
            <Label htmlFor="bookingUrl">
              Booking link{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="bookingUrl"
              name="bookingUrl"
              type="url"
              defaultValue={profile?.booking_cta_url ?? ""}
              placeholder="https://"
              inputMode="url"
            />
          </div>
        </div>
        {state.error ? (
          <ValidationMessage>{state.error}</ValidationMessage>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save and continue"}
          </Button>
          {!profile?.setup_completed_at ? (
            <Button
              type="submit"
              name="intent"
              value="skip-optional"
              variant="secondary"
              disabled={isPending}
            >
              Skip optional details
            </Button>
          ) : null}
        </div>
      </form>
      <Card aria-label="Live profile preview" className="lg:sticky lg:top-8">
        <CardContent>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-strong">
            Profile preview
          </p>
          <div className="mt-5 flex items-center gap-3">
            {avatarPreviewUrl ? (
              <Image
                src={avatarPreviewUrl}
                alt="Selected profile preview"
                className="size-14 rounded-full border border-border object-cover"
                height={56}
                width={56}
                unoptimized
              />
            ) : (
              <Avatar
                initials={
                  avatarPath ? "✓" : previewName.slice(0, 2).toUpperCase()
                }
              />
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{previewName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your client gallery identity
              </p>
            </div>
          </div>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            type="button"
            disabled
          >
            {bookingCtaLabel.trim() || "Check availability"}
          </Button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Preview only. Client galleries are not available yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

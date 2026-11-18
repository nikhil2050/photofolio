"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/actions/profile";
import type { PhotographerProfile } from "@/lib/profile/repository";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import {
  HelperText,
  Label,
  SuccessMessage,
  ValidationMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const initialState: ProfileFormState = {};

export function ProfileForm({
  profile,
  userId,
}: {
  profile: PhotographerProfile | null;
  userId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    saveProfile,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <AvatarUpload
        userId={userId}
        initialPath={profile?.avatar_path ?? null}
      />
      <div>
        <Label htmlFor="displayName">Studio or display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={profile?.display_name ?? ""}
          autoComplete="organization"
          required
        />
        <HelperText>This will appear on future client galleries.</HelperText>
      </div>
      <div>
        <Label htmlFor="contactPhone">
          WhatsApp number{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
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
      <div>
        <Label htmlFor="bookingUrl">
          Booking link{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
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
      <div>
        <Label htmlFor="bookingCtaLabel">
          Booking button label{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="bookingCtaLabel"
          name="bookingCtaLabel"
          defaultValue={profile?.booking_cta_label ?? "Book a shoot"}
          placeholder="Book a shoot"
        />
      </div>
      {state.error ? (
        <ValidationMessage>{state.error}</ValidationMessage>
      ) : null}
      {state.success ? <SuccessMessage>{state.success}</SuccessMessage> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

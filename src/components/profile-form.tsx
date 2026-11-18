"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileFormState } from "@/app/actions/profile";
import type { PhotographerProfile } from "@/lib/profile/repository";
import { AvatarUpload } from "@/components/avatar-upload";

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
        <label className="field-label" htmlFor="displayName">
          Studio or display name
        </label>
        <input
          className="field"
          id="displayName"
          name="displayName"
          defaultValue={profile?.display_name}
          autoComplete="organization"
          required
        />
        <p className="mt-2 text-sm text-muted-foreground">
          This will appear on future client galleries.
        </p>
      </div>
      <div>
        <label className="field-label" htmlFor="contactPhone">
          Contact or WhatsApp number{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          className="field"
          id="contactPhone"
          name="contactPhone"
          defaultValue={profile?.contact_phone ?? ""}
          autoComplete="tel"
          inputMode="tel"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="bookingUrl">
          Booking link{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          className="field"
          id="bookingUrl"
          name="bookingUrl"
          type="url"
          defaultValue={profile?.booking_url ?? ""}
          placeholder="https://"
          inputMode="url"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="bookingCtaLabel">
          Booking button label{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <input
          className="field"
          id="bookingCtaLabel"
          name="bookingCtaLabel"
          defaultValue={profile?.booking_cta_label ?? "Book a shoot"}
          placeholder="Book a shoot"
        />
      </div>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="form-success" role="status">
          {state.success}
        </p>
      ) : null}
      <button
        className="button button-primary"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

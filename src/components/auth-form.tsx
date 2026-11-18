"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";

type AuthAction = (state: FormState, formData: FormData) => Promise<FormState>;

const initialState: FormState = {};

export function AuthForm({
  action,
  submitLabel,
}: {
  action: AuthAction;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <label className="field-label" htmlFor="email">
          Email address
        </label>
        <input
          className="field"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          className="field"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Use at least 8 characters.
        </p>
      </div>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="form-success" role="status">
          {state.message}
        </p>
      ) : null}
      <button
        className="button button-primary w-full"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}

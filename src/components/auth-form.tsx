"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  HelperText,
  Label,
  SuccessMessage,
  ValidationMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type AuthAction = (state: FormState, formData: FormData) => Promise<FormState>;

const initialState: FormState = {};

export function AuthForm({
  action,
  submitLabel,
  mode,
  redirectTo,
}: {
  action: AuthAction;
  submitLabel: string;
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {redirectTo ? (
        <input type="hidden" name="next" value={redirectTo} />
      ) : null}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={
            state.fieldErrors?.email ? "email-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.email)}
          required
        />
        {state.fieldErrors?.email ? (
          <ValidationMessage id="email-error" className="mt-2">
            {state.fieldErrors.email}
          </ValidationMessage>
        ) : null}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "sign-up" ? "new-password" : "current-password"
          }
          minLength={8}
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          aria-invalid={Boolean(state.fieldErrors?.password)}
          required
        />
        {mode === "sign-up" ? (
          <HelperText>Use at least 8 characters.</HelperText>
        ) : null}
        {state.fieldErrors?.password ? (
          <ValidationMessage id="password-error" className="mt-2">
            {state.fieldErrors.password}
          </ValidationMessage>
        ) : null}
      </div>
      {mode === "sign-up" ? (
        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-describedby={
              state.fieldErrors?.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            required
          />
          {state.fieldErrors?.confirmPassword ? (
            <ValidationMessage id="confirm-password-error" className="mt-2">
              {state.fieldErrors.confirmPassword}
            </ValidationMessage>
          ) : null}
        </div>
      ) : null}
      {state.formError ? (
        <ValidationMessage>{state.formError}</ValidationMessage>
      ) : null}
      {state.message ? <SuccessMessage>{state.message}</SuccessMessage> : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Please wait…" : submitLabel}
      </Button>
    </form>
  );
}

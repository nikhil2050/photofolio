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
}: {
  action: AuthAction;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
        <HelperText>Use at least 8 characters.</HelperText>
      </div>
      {state.error ? (
        <ValidationMessage>{state.error}</ValidationMessage>
      ) : null}
      {state.message ? <SuccessMessage>{state.message}</SuccessMessage> : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Please wait…" : submitLabel}
      </Button>
    </form>
  );
}

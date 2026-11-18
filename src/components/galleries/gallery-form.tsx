"use client";

import { useActionState } from "react";
import { createGallery, type GalleryFormState } from "@/app/actions/galleries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelperText, Label, ValidationMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: GalleryFormState = {};

export function GalleryForm() {
  const [state, formAction, isPending] = useActionState(
    createGallery,
    initialState,
  );

  return (
    <Card className="mt-10 max-w-2xl">
      <CardContent>
        <form action={formAction} className="space-y-6" noValidate>
          <div>
            <Label htmlFor="title">Gallery title</Label>
            <Input
              id="title"
              name="title"
              autoComplete="off"
              aria-describedby={
                state.fieldErrors?.title ? "title-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.title)}
              required
            />
            {state.fieldErrors?.title ? (
              <ValidationMessage id="title-error" className="mt-2">
                {state.fieldErrors.title}
              </ValidationMessage>
            ) : null}
          </div>

          <div>
            <Label htmlFor="clientName">
              Client or event name{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="clientName"
              name="clientName"
              autoComplete="off"
              aria-describedby={
                state.fieldErrors?.clientName ? "client-name-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.clientName)}
            />
            {state.fieldErrors?.clientName ? (
              <ValidationMessage id="client-name-error" className="mt-2">
                {state.fieldErrors.clientName}
              </ValidationMessage>
            ) : null}
          </div>

          <div>
            <Label htmlFor="description">
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              maxLength={2000}
              aria-describedby={
                state.fieldErrors?.description ? "description-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.description)}
            />
            <HelperText>
              Give your client a little context, if it helps.
            </HelperText>
            {state.fieldErrors?.description ? (
              <ValidationMessage id="description-error" className="mt-2">
                {state.fieldErrors.description}
              </ValidationMessage>
            ) : null}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="eventDate">
                Event date{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                aria-describedby={
                  state.fieldErrors?.eventDate ? "event-date-error" : undefined
                }
                aria-invalid={Boolean(state.fieldErrors?.eventDate)}
              />
              {state.fieldErrors?.eventDate ? (
                <ValidationMessage id="event-date-error" className="mt-2">
                  {state.fieldErrors.eventDate}
                </ValidationMessage>
              ) : null}
            </div>
            <div>
              <Label htmlFor="location">
                Location{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="location"
                name="location"
                autoComplete="address-level2"
                aria-describedby={
                  state.fieldErrors?.location ? "location-error" : undefined
                }
                aria-invalid={Boolean(state.fieldErrors?.location)}
              />
              {state.fieldErrors?.location ? (
                <ValidationMessage id="location-error" className="mt-2">
                  {state.fieldErrors.location}
                </ValidationMessage>
              ) : null}
            </div>
          </div>

          {state.formError ? (
            <ValidationMessage>{state.formError}</ValidationMessage>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create gallery"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

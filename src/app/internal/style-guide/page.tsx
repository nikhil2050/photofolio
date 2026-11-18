import { Camera, Images } from "lucide-react";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  HelperText,
  Label,
  SuccessMessage,
  ValidationMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-background px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[var(--content-marketing)] space-y-12">
        <PageHeader
          eyebrow="Internal only"
          title="Photofolio visual system"
          description="A development preview of the actual reusable components and semantic tokens."
          action={<Badge>Light theme</Badge>}
        />
        <Section title="Actions">
          <div className="flex flex-wrap gap-3">
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link action</Button>
            <Button aria-label="Camera action" size="icon" variant="outline">
              <Camera size={18} aria-hidden="true" />
            </Button>
          </div>
        </Section>
        <Section title="Inputs and feedback">
          <Card>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="sample-title">Gallery title</Label>
                  <Input
                    id="sample-title"
                    placeholder="Spring studio session"
                  />
                  <HelperText>
                    Use a clear name your client will recognise.
                  </HelperText>
                </div>
                <div>
                  <Label htmlFor="sample-notes">Client note</Label>
                  <Textarea
                    id="sample-notes"
                    placeholder="A short note for your client"
                  />
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <ValidationMessage>
                  This field needs attention.
                </ValidationMessage>
                <SuccessMessage>Your profile has been saved.</SuccessMessage>
              </div>
            </CardContent>
          </Card>
        </Section>
        <Section title="Status and surfaces">
          <div className="grid gap-4 md:grid-cols-3">
            <Alert tone="info">
              Private previews are prepared for future gallery delivery.
            </Alert>
            <Alert tone="success">Changes are saved.</Alert>
            <Alert tone="error">An upload could not be completed.</Alert>
          </div>
          <Separator className="my-8" />
          <div className="flex items-center gap-4">
            <Avatar initials="PF" />
            <Badge>Draft</Badge>
            <Skeleton className="h-4 w-40" />
          </div>
        </Section>
        <Section title="Empty state">
          <EmptyState
            icon={Images}
            title="No galleries yet"
            description="Use empty states to explain what is absent and what becomes available next."
            action={<Button variant="secondary">Learn more</Button>}
          />
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

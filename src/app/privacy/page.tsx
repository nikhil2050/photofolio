import { LegalPage } from "@/components/shared/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        This draft privacy page documents the product’s Phase 1 approach.
        Photofolio stores account and studio-profile information needed to
        provide authenticated access to the application.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Private images
        </h2>
        <p className="mt-2">
          Original photographs and preview images are designed to remain private
          by default. Future gallery access will use explicit authorization and
          time-limited access URLs rather than permanent public file links.
        </p>
      </section>
      <p>
        This page must be reviewed and completed with the business’s final
        contact, retention, and legal-compliance details before public launch.
      </p>
    </LegalPage>
  );
}

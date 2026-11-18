import { LegalPage } from "@/components/shared/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      description="How this Phase 1 foundation currently handles studio-account and private-storage data."
    >
      <p>
        This draft describes the current product implementation, not a complete
        privacy notice. The operator must supply verified business details,
        applicable legal bases, retention periods, and contact information
        before Photofolio is offered publicly.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Operator and contact
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            Operator details and privacy contact: [Operator must provide a
            verified business name, address, and contact method.]
          </strong>
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Data currently processed
        </h2>
        <p className="mt-2">
          The current application processes account email through Supabase
          Authentication and studio-profile information such as display name,
          optional profile image path, WhatsApp number, and booking-link
          details. Future galleries, photographs, enquiries, and favourites are
          represented in the data model but are not available to end users yet.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Purposes and legal basis
        </h2>
        <p className="mt-2">
          Account and profile data are used to provide authenticated access and
          studio setup. The operator and legal adviser must determine and state
          the applicable legal bases for each processing activity before launch.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Hosting and service providers
        </h2>
        <p className="mt-2">
          The current implementation uses Supabase for authentication,
          PostgreSQL data, and private object storage. It does not include an
          application analytics integration in Phase 1. The operator must
          confirm actual providers, hosting locations, and any international
          transfers before launch.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Private images and security
        </h2>
        <p className="mt-2">
          Original photographs and controlled previews are configured as private
          storage. Future gallery access must use explicit authorisation and
          short-lived delivery mechanisms rather than permanent public file
          links. These controls reduce risk; they are not an absolute guarantee
          of security.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Retention, deletion, and your rights
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            [The operator must define retention, deletion, export, and data
            rights-request processes before launch.]
          </strong>{" "}
          The final notice should explain how people can request access,
          correction, deletion, or other rights available under applicable law.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Cookies, changes, and effective date
        </h2>
        <p className="mt-2">
          Phase 1 uses essential authentication cookies to maintain a signed-in
          session. No optional analytics or advertising cookies are implemented
          by the application.{" "}
          <strong className="font-semibold text-foreground">
            [The operator must add an effective date, change history, and any
            required cookie information before launch.]
          </strong>
        </p>
      </section>
    </LegalPage>
  );
}

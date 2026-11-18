import { LegalPage } from "@/components/shared/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      description="A plain-language Phase 1 draft of the responsibilities and limits that need legal review before launch."
    >
      <p>
        These terms are a product draft only. They do not create a final
        agreement and must be completed for the relevant jurisdiction by the
        operator and legal adviser before public launch.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Eligibility and account responsibility
        </h2>
        <p className="mt-2">
          Users must provide accurate account information, keep account access
          secure, and use the service only where they are allowed to do so. The
          operator must define any age or business-use requirements before
          launch.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Photographer content and rights
        </h2>
        <p className="mt-2">
          Photographers remain responsible for content they upload and for
          ensuring they have the rights, permissions, and required consents to
          use it. The operator needs a limited licence to host and process that
          content only to operate the service; the final licence terms require
          legal review.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Client galleries and permitted use
        </h2>
        <p className="mt-2">
          Client-gallery delivery is not available in Phase 1. Before it is
          released, the final terms must define authorised gallery access,
          permitted viewing and downloading, privacy expectations, and how
          access can be restricted or withdrawn.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Prohibited use and service availability
        </h2>
        <p className="mt-2">
          The service must not be used for unlawful, infringing, abusive, or
          harmful material or activity. The final terms must define moderation,
          suspension, termination, availability, support, and acceptable-use
          rules without promising uninterrupted service.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Account closure, deletion, and export
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            [The operator must define account closure, deletion, export, and
            retention practices before launch.]
          </strong>{" "}
          Those practices should align with the final privacy notice and any
          applicable legal obligations.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Legal review details
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            [The operator must add liability, warranty, governing-law,
            jurisdiction, verified contact, and effective-date terms after legal
            review.]
          </strong>
        </p>
      </section>
    </LegalPage>
  );
}

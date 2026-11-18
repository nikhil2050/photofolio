import { LegalPage } from "@/components/shared/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of use">
      <p>
        These are Phase 1 placeholder terms. The application is being developed
        as a private foundation and does not yet offer public gallery delivery,
        payments, or print sales.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Photographer content
        </h2>
        <p className="mt-2">
          Photographers remain responsible for content they upload and for
          ensuring they have the rights and permissions required to use it.
        </p>
      </section>
      <p>
        Complete, jurisdiction-appropriate terms must be reviewed before the
        product is offered publicly.
      </p>
    </LegalPage>
  );
}

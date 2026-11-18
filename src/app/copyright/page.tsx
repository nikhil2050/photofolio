import { LegalPage } from "@/components/shared/legal-page";

export default function CopyrightPage() {
  return (
    <LegalPage
      title="Copyright and takedown requests"
      description="How to prepare a report of alleged copyright infringement once the operator has established a verified reporting channel."
    >
      <p>
        Photofolio is intended to help photographers present and deliver work
        they are entitled to share. It does not grant rights to use, copy, or
        distribute photographs belonging to others.
      </p>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Reporting contact
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            [The operator must provide a verified copyright-reporting contact
            method before launch.]
          </strong>{" "}
          This page does not submit a report or create an automated takedown
          request.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Information a report should include
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Your name and reliable contact details.</li>
          <li>Identification of the original work you believe is affected.</li>
          <li>
            The exact Photofolio URL, gallery identifier, or photo identifier
            for the material you are reporting.
          </li>
          <li>
            A short explanation of the claim and your authority to submit it.
          </li>
          <li>
            A good-faith statement and accuracy declaration, subject to the
            final process and applicable law.
          </li>
        </ol>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          What the operator may do
        </h2>
        <p className="mt-2">
          A report should be acknowledged and assessed under the final policy.
          The operator may seek more information, restrict access while a claim
          is reviewed, decline an unsupported request, or restore material when
          appropriate. A report alone does not establish infringement.
        </p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-foreground">
          Counter-notices and disputes
        </h2>
        <p className="mt-2">
          <strong className="font-semibold text-foreground">
            [The operator must define a legally appropriate counter-notice and
            dispute route before launch.]
          </strong>{" "}
          That process should be reviewed for the jurisdictions in which the
          service is offered.
        </p>
      </section>
    </LegalPage>
  );
}

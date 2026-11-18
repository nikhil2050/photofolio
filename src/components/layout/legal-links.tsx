import Link from "next/link";

export function LegalLinks() {
  return (
    <nav
      aria-label="Legal"
      className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
    >
      <Link className="underline-offset-4 hover:underline" href="/privacy">
        Privacy
      </Link>
      <Link className="underline-offset-4 hover:underline" href="/terms">
        Terms
      </Link>
      <Link className="underline-offset-4 hover:underline" href="/copyright">
        Copyright
      </Link>
    </nav>
  );
}

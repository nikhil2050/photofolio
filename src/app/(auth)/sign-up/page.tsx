import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <>
      <div className="mt-10">
        <p className="text-sm font-medium text-[var(--accent-strong)]">
          Your studio starts here
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create your studio account
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Begin with the essentials. You can complete your public-facing studio
          profile next.
        </p>
      </div>
      <div className="mt-8">
        <AuthForm action={signUp} submitLabel="Create account" />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-semibold text-[var(--accent-strong)] underline underline-offset-4"
          href="/sign-in"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

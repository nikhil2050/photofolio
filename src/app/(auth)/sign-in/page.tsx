import Link from "next/link";
import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function SignInPage() {
  return (
    <>
      <div className="mt-10">
        <p className="text-sm font-medium text-[var(--accent-strong)]">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Sign in to your studio
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Use the email and password you chose when you created your account.
        </p>
      </div>
      <div className="mt-8">
        <AuthForm action={signIn} submitLabel="Sign in" />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        New to Photofolio?{" "}
        <Link
          className="font-semibold text-[var(--accent-strong)] underline underline-offset-4"
          href="/sign-up"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}

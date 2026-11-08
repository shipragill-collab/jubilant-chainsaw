"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Friendly fallback for unexpected errors on any page. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="panel mx-auto my-14 max-w-xl space-y-3 p-7">
      <h1 className="text-title-lg font-semibold">Something went wrong on this page</h1>
      <p className="text-body-lg text-muted-foreground">Try again in a moment. If it keeps happening, let the site owner know{error.digest ? ` and mention code ${error.digest}` : ""}.</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <button type="button" onClick={reset} className="h-10 rounded-full bg-primary px-5 font-medium text-primary-foreground">
          Try again
        </button>
        <Link href="/" className="inline-flex h-10 items-center px-2 underline underline-offset-4">
          Home
        </Link>
      </div>
    </div>
  );
}

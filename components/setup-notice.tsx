import Link from "next/link";

/** Shown when the site has no database yet, instead of crashing. */
export function SetupNotice({ what }: { what: string }) {
  return (
    <div className="panel mx-auto my-14 max-w-2xl space-y-3 p-7">
      <h1 className="text-title-lg font-semibold">The {what} isn&apos;t available yet</h1>
      <p className="text-body-lg text-muted-foreground">
        This site&apos;s database isn&apos;t connected, so there&apos;s nothing saved to show. Everything else that doesn&apos;t need saved data still works.
      </p>
      <div className="rounded-2xl bg-surface p-4 text-body">
        <p className="font-semibold">If you run this site</p>
        <p className="text-muted-foreground">
          In Vercel, open the project&apos;s <strong>Storage</strong> tab, create a <strong>Neon</strong> database on the free plan and connect it to the project.
          Then go to <strong>Deployments</strong> and choose <strong>Redeploy</strong>. The steps are in DEPLOY.md.
        </p>
      </div>
      <Link href="/" className="inline-block text-body underline underline-offset-4">
        Back to the home page
      </Link>
    </div>
  );
}

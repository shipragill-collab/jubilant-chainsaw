import { createHash } from "node:crypto";
import Link from "next/link";
import { Card } from "@/components/ui";
import { SetupNotice } from "@/components/setup-notice";
import { isStoreUnavailable, read } from "@/lib/store";
import { StudySetView } from "./study-set-view";

export const dynamic = "force-dynamic";

export default async function StudySetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let set;
  try {
    set = (await read()).studySets[id];
  } catch (err) {
    if (isStoreUnavailable(err)) return <SetupNotice what="study set" />;
    throw err;
  }
  if (!set) {
    return (
      <Card className="text-center">
        <p className="text-body text-muted-foreground">This study set doesn&apos;t exist or was deleted.</p>
        <Link href="/study" className="mt-3 inline-block text-label text-brand hover:underline">
          Create a study set
        </Link>
      </Card>
    );
  }
  const { ownerId, material: _material, ...rest } = set;
  // Only a hash goes to the browser, so viewers can't learn (and reuse) the owner's id.
  const ownerHash = createHash("sha256").update(ownerId).digest("hex");
  return <StudySetView set={rest} ownerHash={ownerHash} />;
}

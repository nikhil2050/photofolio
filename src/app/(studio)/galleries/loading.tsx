import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleriesLoading() {
  return (
    <div className="max-w-[var(--content-dashboard)]">
      <PageHeader
        eyebrow="Gallery library"
        title="Galleries"
        description="Loading your galleries…"
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-[4/5] rounded-card" />
        ))}
      </div>
    </div>
  );
}

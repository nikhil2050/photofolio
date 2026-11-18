import Link from "next/link";
import { Images, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { GalleryCard } from "@/components/galleries/gallery-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { listGalleries } from "@/lib/galleries/repository";
import { getProfile } from "@/lib/profile/repository";
import {
  parseGalleryListFilters,
  type GalleryStatusFilter,
} from "@/lib/validation/gallery";

type GallerySearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

const filterLabels: Record<GalleryStatusFilter, string> = {
  all: "All",
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export default async function GalleriesPage({
  searchParams,
}: {
  searchParams: Promise<GallerySearchParams>;
}) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);
  const profile = await getProfile(user.id);
  if (!profile?.setup_completed_at) redirect("/profile");

  const filters = parseGalleryListFilters(query);
  const result = await listGalleries(profile.id, filters);
  const isFiltered = Boolean(filters.search) || filters.status !== "all";

  return (
    <div className="max-w-[var(--content-dashboard)]">
      <PageHeader
        eyebrow="Gallery library"
        title="Galleries"
        description="Create and organise the private galleries you will share with clients."
        action={
          <Button asChild>
            <Link href="/galleries/new">Create gallery</Link>
          </Button>
        }
      />

      <GalleryFilters filters={filters} />

      {result.totalCount === 0 ? (
        <EmptyState
          className="mt-10"
          icon={Images}
          title={
            isFiltered
              ? "No galleries match these filters"
              : "Your first gallery starts here"
          }
          description={
            isFiltered
              ? "Try another search or view all of your galleries."
              : "Create a private draft, then add the photographs you want to share."
          }
          action={
            isFiltered ? (
              <Button variant="secondary" asChild>
                <Link href="/galleries">View all galleries</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/galleries/new">Create gallery</Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {result.galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
          <GalleryPagination
            filters={filters}
            page={result.page}
            totalCount={result.totalCount}
            pageSize={result.pageSize}
          />
        </>
      )}
    </div>
  );
}

function GalleryFilters({
  filters,
}: {
  filters: ReturnType<typeof parseGalleryListFilters>;
}) {
  return (
    <div className="mt-10 space-y-4">
      <form action="/galleries" className="flex flex-col gap-3 sm:flex-row">
        <input name="status" type="hidden" value={filters.status} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search galleries</span>
          <Input
            defaultValue={filters.search}
            name="q"
            placeholder="Search by gallery or client"
            type="search"
          />
        </label>
        <Button className="sm:shrink-0" type="submit" variant="secondary">
          <Search size={17} aria-hidden="true" /> Search
        </Button>
      </form>
      <nav aria-label="Gallery status filters" className="flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as GalleryStatusFilter[]).map((status) => (
          <Button
            key={status}
            asChild
            size="small"
            variant={filters.status === status ? "primary" : "ghost"}
          >
            <Link href={galleryHref({ ...filters, status, page: 1 })}>
              {filterLabels[status]}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}

function GalleryPagination({
  filters,
  page,
  totalCount,
  pageSize,
}: {
  filters: ReturnType<typeof parseGalleryListFilters>;
  page: number;
  totalCount: number;
  pageSize: number;
}) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Gallery pages"
      className="mt-8 flex items-center justify-between gap-4"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild size="small" variant="secondary">
            <Link href={galleryHref({ ...filters, page: page - 1 })}>
              Previous
            </Link>
          </Button>
        ) : null}
        {page < totalPages ? (
          <Button asChild size="small" variant="secondary">
            <Link href={galleryHref({ ...filters, page: page + 1 })}>Next</Link>
          </Button>
        ) : null}
      </div>
    </nav>
  );
}

function galleryHref(filters: ReturnType<typeof parseGalleryListFilters>) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/galleries?${query}` : "/galleries";
}

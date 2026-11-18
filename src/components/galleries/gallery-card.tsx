import Link from "next/link";
import { CalendarDays, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GalleryListItem } from "@/lib/galleries/repository";
import { cn } from "@/lib/utils/cn";

const statusClassNames = {
  draft: "bg-surface-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  archived: "bg-warning/10 text-warning",
};

export function GalleryCard({ gallery }: { gallery: GalleryListItem }) {
  return (
    <Card className="overflow-hidden">
      <div
        className="flex aspect-[4/3] items-center justify-center border-b border-border bg-surface-muted"
        aria-hidden="true"
      >
        <ImageIcon
          className="text-muted-foreground"
          size={30}
          aria-hidden="true"
        />
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              className="block truncate text-lg font-semibold underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2"
              href={`/galleries/${gallery.id}`}
            >
              {gallery.title}
            </Link>
            {gallery.client_name ? (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {gallery.client_name}
              </p>
            ) : null}
          </div>
          <Badge
            className={cn(
              "shrink-0 capitalize",
              statusClassNames[gallery.status],
            )}
          >
            {gallery.status}
          </Badge>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span>
            {gallery.ready_photo_count}{" "}
            {gallery.ready_photo_count === 1 ? "ready photo" : "ready photos"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={15} aria-hidden="true" />
            Updated {formatUpdatedDate(gallery.updated_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatUpdatedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

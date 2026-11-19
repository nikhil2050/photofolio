"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

const sections = [
  { id: "details", label: "Details" },
  { id: "photos", label: "Photos" },
  { id: "sharing", label: "Sharing" },
] as const;

/**
 * Section links give the long editor a calm, keyboard-accessible orientation
 * aid. The observer only changes presentation; each anchor remains a normal
 * link if browser features or JavaScript are unavailable.
 */
export function GalleryEditorNavigation() {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]["id"]>("details");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id as (typeof sections)[number]["id"]);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="mt-8 flex flex-wrap gap-2" aria-label="Gallery editor sections">
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={activeSection === id ? "page" : undefined}
          className={cn(
            "inline-flex min-h-10 items-center rounded-control border px-3 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2",
            activeSection === id
              ? "border-foreground bg-foreground text-white"
              : "border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground",
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

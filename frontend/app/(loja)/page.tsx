"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "../components/Hero/HeroSection";

const CatalogSection = dynamic(
  () => import("../components/Catalog/CatalogSection").then((m) => m.CatalogSection),
  { ssr: false, loading: () => <CatalogSectionSkeleton /> },
);

function CatalogSectionSkeleton() {
  return (
    <section className="mb-16">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="h-10 w-48 animate-pulse rounded-lm-md bg-[var(--lm-surface-alt)]" />
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded bg-[var(--lm-surface-alt)]" />
            <div className="h-5 w-24 animate-pulse rounded bg-[var(--lm-surface-alt)]" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-lm-md border border-[var(--lm-border)] bg-[var(--lm-surface)]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <CatalogSection />
    </>
  );
}

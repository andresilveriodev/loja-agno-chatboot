"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "./components/Hero/HeroSection";

const CatalogSection = dynamic(
  () => import("./components/Catalog/CatalogSection").then((m) => m.CatalogSection),
  { ssr: false, loading: () => <CatalogSectionSkeleton /> },
);

function CatalogSectionSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-primary-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-7 w-48 animate-pulse rounded bg-primary-200" />
            <div className="h-5 w-24 animate-pulse rounded bg-primary-100" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-xl border border-primary-200 bg-primary-50"
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

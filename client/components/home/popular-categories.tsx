import { CategoryCard } from "@/components/shared/category-card";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export function PopularCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Browse by Specialty
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Popular Repair Categories
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a category to jump straight to approved specialists.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {SERVICE_CATEGORIES.map((category) => (
          <CategoryCard key={category} category={category} />
        ))}
      </div>
    </section>
  );
}

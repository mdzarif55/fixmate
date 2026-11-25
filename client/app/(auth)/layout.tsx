import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-8">
        <BrandLogo />
        <div className="flex items-center gap-3">
          <Link
            href="/services"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Services
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}

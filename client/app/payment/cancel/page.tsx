import Link from "next/link";
import { RotateCcw, XCircle } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const isProUpgrade = type === "pro_upgrade";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <XCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Payment cancelled.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {isProUpgrade
                  ? "No charges were made and your account remains on the Free plan. You can upgrade to FixMate Pro ($50 USD) anytime from your dashboard."
                  : "No charges were made and nothing changed in your booking. You can return to your bookings and retry payment whenever you are ready."}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild>
                <Link
                  href={
                    isProUpgrade
                      ? "/dashboard/technician"
                      : "/dashboard/customer/bookings"
                  }
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Try Again</span>
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ServiceItem } from "@/types";

interface ServiceCardProps {
  service: ServiceItem;
  showArea?: boolean;
}

export function ServiceCard({ service, showArea = true }: ServiceCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge className="bg-card/90 text-foreground backdrop-blur-xs border-border/60">
            {service.category}
          </Badge>
          <Badge variant="accent" className="bg-card/90 backdrop-blur-xs">
            {service.serviceMode}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-brand transition-colors">
          {service.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground/90">
            <Wrench className="h-3.5 w-3.5 text-brand" />
            {service.technicianName}
            {service.technicianIsPro ? (
              <ShieldCheck
                aria-label="Verified Pro Technician"
                className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400"
              />
            ) : null}
          </span>

          {service.reviewCount && service.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Star className="h-3.5 w-3.5 fill-current" />
              {Number(service.ratingAverage || 0).toFixed(1)} ({service.reviewCount})
            </span>
          ) : null}
        </div>

        {showArea && service.serviceArea ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{service.serviceArea}</span>
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between border-t border-border bg-secondary/20 px-5 py-3.5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Starting at
          </p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(service.basePrice)}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/services/${service._id}`}>
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

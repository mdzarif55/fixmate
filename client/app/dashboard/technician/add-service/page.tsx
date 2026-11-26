"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthUser } from "@/hooks/use-auth-user";
import { apiFetch, ApiError } from "@/lib/api";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/constants";

const createServiceSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  category: z.enum(SERVICE_CATEGORIES),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters."),
  basePrice: z.coerce
    .number()
    .positive("Base price must be greater than zero."),
  estimatedDuration: z
    .string()
    .trim()
    .min(2, "Estimated duration is required."),
  serviceMode: z.enum(SERVICE_MODES),
  serviceArea: z.string().trim().min(2, "Service area is required."),
  image: z.string().trim().url("Please upload a service image."),
});

type CreateServiceInput = z.input<typeof createServiceSchema>;
type CreateServiceValues = z.output<typeof createServiceSchema>;

export default function AddServicePage() {
  const router = useRouter();
  const { user } = useAuthUser();

  const form = useForm<CreateServiceInput, unknown, CreateServiceValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      title: "",
      category: "Smartphone",
      description: "",
      basePrice: 50,
      estimatedDuration: "1-2 hours",
      serviceMode: "Home Visit",
      serviceArea: user?.area || "",
      image: "",
    },
  });

  const imageValue = form.watch("image");
  const categoryValue = form.watch("category");
  const modeValue = form.watch("serviceMode");

  const onSubmit = async (values: CreateServiceValues) => {
    try {
      await apiFetch("/api/services", {
        method: "POST",
        auth: true,
        body: values,
      });
      toast.success("Your service has been submitted for admin approval.");
      router.push("/dashboard/technician/my-services");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        toast.error(err.message, {
          action: {
            label: "Upgrade ($50)",
            onClick: () => router.push("/dashboard/technician"),
          },
        });
      } else {
        toast.error(
          err instanceof ApiError ? err.message : "Could not create service."
        );
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Add Repair Service"
        description="Submit a new repair listing. An administrator will review and approve it before it goes live."
      />

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Technician identity ({user?.name} • {user?.email}) is attached
            automatically from your verified session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Service Image (ImgBB Upload)</Label>
              <ImageUploadField
                value={imageValue || undefined}
                onChange={(url) =>
                  form.setValue("image", url, { shouldValidate: true })
                }
                label="Upload Service Photo"
                error={form.formState.errors.image?.message}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Service Title</Label>
              <Input
                id="title"
                placeholder="e.g. Split AC Deep Cleaning & Gas Refill"
                {...form.register("title")}
              />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={categoryValue}
                  onValueChange={(val) =>
                    form.setValue(
                      "category",
                      val as (typeof SERVICE_CATEGORIES)[number],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Service Mode</Label>
                <Select
                  value={modeValue}
                  onValueChange={(val) =>
                    form.setValue(
                      "serviceMode",
                      val as (typeof SERVICE_MODES)[number],
                      { shouldValidate: true }
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_MODES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="basePrice">Starting Price (USD)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="1"
                  {...form.register("basePrice")}
                />
                {form.formState.errors.basePrice ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.basePrice.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                <Input
                  id="estimatedDuration"
                  placeholder="1-2 hours"
                  {...form.register("estimatedDuration")}
                />
                {form.formState.errors.estimatedDuration ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.estimatedDuration.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serviceArea">Service Area</Label>
                <Input
                  id="serviceArea"
                  placeholder="Downtown Austin"
                  {...form.register("serviceArea")}
                />
                {form.formState.errors.serviceArea ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.serviceArea.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">
                Service Description (minimum 20 characters)
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Explain what is included, parts/diagnostics policy, and warranty details..."
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

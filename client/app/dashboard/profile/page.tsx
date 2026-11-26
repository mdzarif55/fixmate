"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuthUser } from "@/hooks/use-auth-user";
import { apiFetch, ApiError } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim().max(30).optional(),
  area: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  image: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refetch } = useAuthUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      area: "",
      bio: "",
      image: null,
    },
  });

  const { reset } = form;
  const userId = user?.id;
  const userName = user?.name || "";
  const userPhone = user?.phone || "";
  const userArea = user?.area || "";
  const userBio = user?.bio || "";
  const userImage = user?.image || null;

  React.useEffect(() => {
    if (!userId) return;
    reset({
      name: userName,
      phone: userPhone,
      area: userArea,
      bio: userBio,
      image: userImage,
    });
  }, [userId, userName, userPhone, userArea, userBio, userImage, reset]);

  const imageValue = form.watch("image");

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await apiFetch("/api/users/profile", {
        method: "PATCH",
        auth: true,
        body: {
          name: values.name,
          phone: values.phone || "",
          area: values.area || "",
          bio: values.bio || "",
          image: values.image || null,
        },
      });
      await refetch();
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update profile."
      );
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your public profile details, contact information, and photo."
        actions={<StatusBadge status={user.role} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Changes update immediately across your navbar and dashboard without
            signing out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Photo (ImgBB)</Label>
              <ImageUploadField
                value={imageValue || undefined}
                onChange={(url) => form.setValue("image", url)}
                label="Upload Profile Photo"
                round
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Email Address (Read-only)</Label>
                <Input value={user.email} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Account Role (Read-only)</Label>
                <Input
                  value={user.role.toUpperCase()}
                  readOnly
                  className="bg-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 555-019-2834"
                  {...form.register("phone")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area">City / Service Area</Label>
              <Input
                id="area"
                placeholder="e.g. Downtown Austin, TX"
                {...form.register("area")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder="Tell customers or technicians a little about yourself..."
                {...form.register("bio")}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
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

"use client";

import * as React from "react";
import Link from "next/link";
import { Edit3, Loader2, PlusCircle, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ImageUploadField } from "@/components/shared/image-upload-field";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { ServiceItem } from "@/types";

export default function TechnicianMyServicesPage() {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<ServiceItem | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  const [editTarget, setEditTarget] = React.useState<ServiceItem | null>(null);
  const [editForm, setEditForm] = React.useState({
    title: "",
    category: "Smartphone",
    description: "",
    basePrice: 50,
    estimatedDuration: "",
    serviceMode: "Home Visit",
    serviceArea: "",
    image: "",
  });
  const [savingEdit, setSavingEdit] = React.useState(false);

  const loadServices = React.useCallback(async () => {
    try {
      const data = await apiFetch<{ services: ServiceItem[] }>(
        "/api/services/technician/my",
        { auth: true }
      );
      setServices(data.services || []);
    } catch {
      toast.error("Failed to load your services.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    apiFetch<{ services: ServiceItem[] }>("/api/services/technician/my", {
      auth: true,
    })
      .then((data) => {
        if (active) setServices(data.services || []);
      })
      .catch(() => {
        if (active) toast.error("Failed to load your services.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const openEditModal = (service: ServiceItem) => {
    setEditTarget(service);
    setEditForm({
      title: service.title,
      category: service.category,
      description: service.description,
      basePrice: service.basePrice,
      estimatedDuration: service.estimatedDuration,
      serviceMode: service.serviceMode,
      serviceArea: service.serviceArea,
      image: service.image,
    });
  };

  const handleToggleAvailability = async (service: ServiceItem) => {
    try {
      await apiFetch(`/api/services/${service._id}`, {
        method: "PATCH",
        auth: true,
        body: { isAvailable: !service.isAvailable },
      });
      toast.success(
        !service.isAvailable
          ? "Service marked available on marketplace."
          : "Service hidden from public marketplace."
      );
      await loadServices();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Could not update availability."
      );
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    if (Number(editForm.basePrice) <= 0) {
      toast.error("Price must be greater than zero.");
      return;
    }

    setSavingEdit(true);
    try {
      await apiFetch(`/api/services/${editTarget._id}`, {
        method: "PATCH",
        auth: true,
        body: {
          ...editForm,
          basePrice: Number(editForm.basePrice),
        },
      });
      toast.success(
        "Service updated and resubmitted for admin approval (status: pending)."
      );
      setEditTarget(null);
      await loadServices();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to update service."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/services/${deleteTarget._id}`, {
        method: "DELETE",
        auth: true,
      });
      toast.success("Service deleted.");
      setDeleteTarget(null);
      await loadServices();
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete service."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Services"
        description="Edit listings, toggle public availability, or add new repair offerings. Editing a service returns its approval status to pending."
        actions={
          <Button asChild>
            <Link href="/dashboard/technician/add-service">
              <PlusCircle className="h-4 w-4" />
              <span>Add Service</span>
            </Link>
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={4} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services listed yet"
          description="Create your first repair service to start receiving bookings from customers."
          action={
            <Button asChild>
              <Link href="/dashboard/technician/add-service">
                Add First Service
              </Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-11 w-14 rounded-lg object-cover border border-border"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {service.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {service.serviceMode} • {service.serviceArea}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(service.basePrice)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.approvalStatus} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.isAvailable}
                          onCheckedChange={() =>
                            handleToggleAvailability(service)
                          }
                          aria-label={`Toggle availability for ${service.title}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {service.isAvailable ? "Public" : "Hidden"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(service)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(service)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog
        open={Boolean(editTarget)}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Saving changes to service details resets approval status to{" "}
              <strong>pending</strong> until reviewed by an admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <ImageUploadField
              value={editForm.image}
              onChange={(url) => setEditForm((f) => ({ ...f, image: url }))}
              label="Replace Image"
            />

            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(val) =>
                    setEditForm((f) => ({ ...f, category: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  value={editForm.serviceMode}
                  onValueChange={(val) =>
                    setEditForm((f) => ({ ...f, serviceMode: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit-price">Base Price (USD)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="1"
                  step="0.01"
                  value={editForm.basePrice}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      basePrice: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-duration">Est. Duration</Label>
                <Input
                  id="edit-duration"
                  value={editForm.estimatedDuration}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      estimatedDuration: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-area">Service Area</Label>
                <Input
                  id="edit-area"
                  value={editForm.serviceArea}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, serviceArea: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                rows={4}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Service"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
        confirmLabel="Yes, Delete Service"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

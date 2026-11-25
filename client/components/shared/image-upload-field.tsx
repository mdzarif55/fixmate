"use client";

import * as React from "react";
import { ImagePlus, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { uploadImageToImgBB } from "@/lib/imgbb";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  round?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Upload Image",
  hint = "PNG, JPG, WebP up to 5MB",
  error,
  className,
  round = false,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      onChange(url);
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!uploading) inputRef.current?.click();
            }
          }}
          className={cn(
            "relative flex cursor-pointer items-center justify-center overflow-hidden border border-dashed border-border bg-secondary/50 transition-colors hover:border-brand hover:bg-secondary",
            round ? "h-24 w-24 rounded-full" : "h-36 w-full sm:w-52 rounded-xl"
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 p-3 text-center text-muted-foreground">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-medium">Choose file</span>
            </div>
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-xs hover:bg-secondary disabled:opacity-50 cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4 text-brand" />
            )}
            <span>{uploading ? "Uploading to ImgBB..." : label}</span>
          </button>
          <p className="text-xs text-muted-foreground">{hint}</p>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

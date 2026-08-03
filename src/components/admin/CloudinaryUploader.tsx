"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { UploadSection } from "@/lib/upload-sections";

type SignedUploadResponse = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  error?: string;
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  error?: { message?: string };
};

export type CloudinaryUploaderProps = {
  /** Portfolio subfolder under `portfolio/` (e.g. "projects", "about"). */
  section: UploadSection;
  onUploadComplete: (url: string) => void;
  /** Existing image URL to show as the current preview. */
  value?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  label?: string;
  disabled?: boolean;
};

export function CloudinaryUploader({
  section,
  onUploadComplete,
  value,
  accept = "image/*,.pdf",
  maxSizeMB = 10,
  className,
  label = "Upload file",
  disabled = false,
}: CloudinaryUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be ${maxSizeMB}MB or smaller.`);
        return;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        const signRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        });

        const signed = (await signRes.json()) as SignedUploadResponse;

        if (!signRes.ok) {
          throw new Error(signed.error || "Failed to get upload signature.");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signed.apiKey);
        formData.append("timestamp", String(signed.timestamp));
        formData.append("signature", signed.signature);
        formData.append("folder", signed.folder);

        const result = await uploadWithProgress(
          `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`,
          formData,
          setProgress,
        );

        if (result.error?.message) {
          throw new Error(result.error.message);
        }

        if (!result.secure_url) {
          throw new Error("Upload succeeded but no URL was returned.");
        }

        setPreviewUrl(result.secure_url);
        onUploadComplete(result.secure_url);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Try again.";
        setError(message);
      } finally {
        setIsUploading(false);
        setProgress(0);
        resetInput();
      }
    },
    [maxSizeMB, onUploadComplete, section],
  );

  const handleFiles = (files: FileList | null) => {
    if (disabled || isUploading || !files?.length) return;
    void uploadFile(files[0]);
  };

  const clearPreview = () => {
    setPreviewUrl(undefined);
    setError(null);
    onUploadComplete("");
    resetInput();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <p className="text-sm font-medium text-foreground">{label}</p>
      ) : null}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || isUploading}
        aria-label={label}
        onKeyDown={(event) => {
          if (disabled || isUploading) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && !isUploading) inputRef.current?.click();
        }}
        className={cn(
          "relative flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors outline-none",
          "hover:border-foreground/30 hover:bg-muted/50",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          isDragging && "border-foreground/40 bg-muted/60",
          (disabled || isUploading) && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(event) => handleFiles(event.target.files)}
        />

        {isUploading ? (
          <div className="flex w-full max-w-xs flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <Progress value={progress} className="w-full">
              <ProgressLabel>Uploading</ProgressLabel>
              <ProgressValue />
            </Progress>
          </div>
        ) : previewUrl ? (
          <div className="flex flex-col items-center gap-3">
            {isImageUrl(previewUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-36 max-w-full rounded-lg object-contain shadow-sm"
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <ImageIcon className="size-4 shrink-0" />
                <span className="max-w-[220px] truncate">{previewUrl}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Click or drop to replace
            </p>
          </div>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-full bg-background border border-border">
              <Upload className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                Up to {maxSizeMB}MB · saved to portfolio/{section}
              </p>
            </div>
          </>
        )}
      </div>

      {previewUrl && !isUploading ? (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearPreview}
            disabled={disabled}
          >
            <X data-icon="inline-start" />
            Remove
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function isImageUrl(url: string): boolean {
  return /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/i.test(url) ||
    url.includes("/image/upload/");
}

function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as CloudinaryUploadResult;
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(
            new Error(
              data.error?.message || `Upload failed (${xhr.status}).`,
            ),
          );
        }
      } catch {
        reject(new Error("Invalid response from Cloudinary."));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.send(formData);
  });
}

export default CloudinaryUploader;

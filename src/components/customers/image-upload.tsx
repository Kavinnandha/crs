"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageUploadProps {
    label: string;
    currentImageUrl?: string;
    currentPublicId?: string;
    onUploadComplete: (url: string, publicId: string) => void;
    onRemove: () => void;
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export function ImageUpload({
    label,
    currentImageUrl,
    currentPublicId,
    onUploadComplete,
    onRemove,
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(async (file: File) => {
        setError(null);

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only PNG and JPG images are allowed");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError("File size must be less than 1MB");
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to Cloudinary
        setUploading(true);
        try {
            // If there's an existing image, delete it first
            if (currentPublicId) {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ publicId: currentPublicId }),
                });
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "crs/customers");

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            onUploadComplete(data.url, data.publicId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            setPreview(currentImageUrl || null);
        } finally {
            setUploading(false);
        }
    }, [currentPublicId, currentImageUrl, onUploadComplete]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = async () => {
        setPreview(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
        onRemove();
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>

            {preview ? (
                <div className="relative group rounded-xl overflow-hidden border border-[#E8E5F0] dark:border-slate-700 bg-[#F8F9FC] dark:bg-slate-800">
                    <div className="relative w-full h-44">
                        <Image
                            src={preview}
                            alt={label}
                            fill
                            className="object-contain p-2"
                            unoptimized={preview.startsWith("data:")}
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    {!uploading && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 p-0 rounded-lg shadow-md"
                                onClick={() => inputRef.current?.click()}
                            >
                                <Upload className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-8 w-8 p-0 rounded-lg shadow-md"
                                onClick={handleRemove}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                        dragOver
                            ? "border-[#7C3AED] bg-[#7C3AED]/5"
                            : "border-[#E8E5F0] dark:border-slate-700 hover:border-[#7C3AED]/50 bg-[#F8F9FC] dark:bg-slate-800"
                    }`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    <ImageIcon className="h-8 w-8 text-[#94a3b8] mb-2" />
                    <p className="text-sm text-[#64748B] dark:text-slate-400 font-medium">
                        Click or drag to upload
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                        PNG, JPG up to 1MB
                    </p>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={handleChange}
            />

            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
}

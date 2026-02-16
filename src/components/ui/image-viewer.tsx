"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageViewerProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
    aspectRatio?: "square" | "video" | "auto"
}

export function ImageViewer({
    src,
    alt,
    className,
    aspectRatio = "auto"
}: ImageViewerProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (!src) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className={cn(
                        "relative group cursor-pointer overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors",
                        className
                    )}
                >
                    <div className={cn(
                        "relative w-full flex items-center justify-center",
                        aspectRatio === "square" ? "aspect-square" :
                            aspectRatio === "video" ? "aspect-video" : "h-52 w-full"
                    )}>
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                        <Button variant="secondary" size="sm" className="gap-2 font-medium shadow-lg">
                            <ZoomIn className="h-4 w-4" />
                            View Full Size
                        </Button>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent
                className="max-w-[90vw] md:max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-2xl"
                showCloseButton={true}
            >
                <DialogHeader className="p-4 border-b bg-background/50 backdrop-blur-md absolute top-0 left-0 right-0 z-50 flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <DialogTitle className="text-base font-medium truncate pr-12">{alt}</DialogTitle>
                        <DialogDescription className="text-xs">
                            Click outside or press Esc to close
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="relative flex-1 w-full h-full bg-black/5 dark:bg-black/20 flex items-center justify-center p-4 pt-20">
                    <div className="relative w-full h-full">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            quality={90}
                            priority
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

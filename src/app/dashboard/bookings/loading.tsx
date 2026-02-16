
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[140px]" />
                    <Skeleton className="h-10 w-[80px]" />
                </div>
            </div>
            <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-[50px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[40px]" />
                    </div>
                </div>
                <div className="divide-y">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <Skeleton className="h-4 w-[60px]" />
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[120px]" />
                            <Skeleton className="h-4 w-[140px]" />
                            <Skeleton className="h-4 w-[140px]" />
                            <Skeleton className="h-6 w-[90px] rounded-full" />
                            <Skeleton className="h-4 w-[80px]" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

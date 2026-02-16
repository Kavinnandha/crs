
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col items-center">
                        <Skeleton className="h-20 w-20 rounded-full mb-4" />
                        <Skeleton className="h-6 w-[160px] mb-2" />
                        <Skeleton className="h-4 w-[200px] mb-4" />
                        <Skeleton className="h-6 w-[100px] mb-6" />
                        <div className="w-full space-y-3 pt-4 border-t">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-[60px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-[60px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-[60px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-full mt-6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

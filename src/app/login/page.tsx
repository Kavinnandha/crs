"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push("/dashboard/overview");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] dark:bg-slate-950 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 rounded-full overflow-hidden mb-4 ring-4 ring-white dark:ring-slate-800 shadow-lg">
                        <Image src="/carzio.jpg" alt="Carzio" width={64} height={64} className="h-full w-full object-cover" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1a1d2e] dark:text-white tracking-tight">Carzio</h1>
                    <p className="text-sm text-[#94a3b8] mt-1">Admin Dashboard</p>
                </div>

                <Card className="border-[#E8E5F0] dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                    <CardHeader className="text-center pb-2 pt-8">
                        <h2 className="text-xl font-semibold text-[#1a1d2e] dark:text-white">Welcome back</h2>
                        <p className="text-sm text-[#94a3b8] mt-1">Sign in to your admin account</p>
                    </CardHeader>
                    <CardContent className="pt-6 pb-8 px-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#1a1d2e] dark:text-slate-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@carzio.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-[#F8F9FC] dark:bg-slate-800 text-[#1a1d2e] dark:text-white placeholder:text-[#94a3b8] focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED]/40"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[#1a1d2e] dark:text-slate-300">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-11 rounded-xl border-[#E8E5F0] dark:border-slate-700 bg-[#F8F9FC] dark:bg-slate-800 text-[#1a1d2e] dark:text-white placeholder:text-[#94a3b8] focus-visible:ring-[#7C3AED]/20 focus-visible:border-[#7C3AED]/40 pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-[#94a3b8] hover:text-[#64748B] dark:hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium shadow-sm shadow-[#7C3AED]/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-[#94a3b8] mt-6">
                    Carzio Car Rental Management System
                </p>
            </div>
        </div>
    );
}

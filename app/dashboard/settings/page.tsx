"use client";

import { useState } from "react";
import { Settings, Save, Building2, Receipt, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { businessSettings as initialSettings } from "@/lib/mock-data";
import { BusinessSettings } from "@/types";

export default function SettingsPage() {
    const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const update = (field: keyof BusinessSettings, value: string | number) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    return (
        <div>
            <PageHeader title="Settings" description="Configure your business and rental preferences" icon={Settings}>
                <Button onClick={handleSave} disabled={saved}>
                    {saved ? (
                        <>✓ Saved</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                </Button>
            </PageHeader>

            <div className="grid gap-6 max-w-3xl">
                {/* Business Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Business Information
                        </CardTitle>
                        <CardDescription>Basic details about your car rental business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input id="businessName" value={settings.businessName} onChange={(e) => update("businessName", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={settings.currency} onValueChange={(v) => update("currency", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (₹)</SelectItem>
                                        <SelectItem value="USD">USD ($)</SelectItem>
                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Contact Email</Label>
                                <Input id="email" type="email" value={settings.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Contact Phone</Label>
                                <Input id="phone" value={settings.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="address">Business Address</Label>
                            <Textarea id="address" value={settings.address} onChange={(e) => update("address", e.target.value)} rows={2} />
                        </div>
                    </CardContent>
                </Card>

                {/* Tax Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Receipt className="h-4 w-4" /> Tax & Billing
                        </CardTitle>
                        <CardDescription>Configure GST and billing preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="gst">GST Percentage (%)</Label>
                                <Input id="gst" type="number" value={settings.gstPercentage} onChange={(e) => update("gstPercentage", parseFloat(e.target.value))} min={0} max={100} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rental Rules */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ScrollText className="h-4 w-4" /> Rental Rules
                        </CardTitle>
                        <CardDescription>Define your rental terms and conditions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="rules">Rental Rules</Label>
                            <Textarea id="rules" value={settings.rentalRules} onChange={(e) => update("rentalRules", e.target.value)} rows={6} className="font-mono text-sm" />
                        </div>
                    </CardContent>
                </Card>

                {/* Cancellation Policy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ScrollText className="h-4 w-4" /> Cancellation Policy
                        </CardTitle>
                        <CardDescription>Define your cancellation terms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1.5">
                            <Label htmlFor="cancellation">Cancellation Policy</Label>
                            <Textarea id="cancellation" value={settings.cancellationPolicy} onChange={(e) => update("cancellationPolicy", e.target.value)} rows={4} className="font-mono text-sm" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

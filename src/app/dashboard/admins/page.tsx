import { getAdmins } from "@/lib/actions/admin";
import AdminsClient from "./client";

export default async function AdminsPage() {
  const admins = await getAdmins();

  return <AdminsClient admins={admins} />;
}

export const dynamic = "force-dynamic";

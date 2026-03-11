import React from "react";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import AdminLogs from "../../components/pages/admin-logs";

export default async function AdminLogsPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return <AdminLogs />;
}

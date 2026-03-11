import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "../../components/admin/AdminDashboard";
import { auth } from "../../auth";

function AdminPageContent() {
  return <AdminDashboard />;
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <Suspense fallback={<div>Loading admin dashboard...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}

'use client';

import React, { Suspense } from "react";
import AdminDashboard from "../../components/admin/AdminDashboard";

function AdminPageContent() {
  return <AdminDashboard />;
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminPageContent />
    </Suspense>
  );
}

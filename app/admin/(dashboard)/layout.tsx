import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-shell__content">{children}</div>
    </div>
  );
}

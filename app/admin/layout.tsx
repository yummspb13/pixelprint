import type { Metadata } from "next";
import Header from "@/components/site/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AuthProvider } from "@/components/admin/AuthProvider";

export const metadata: Metadata = {
  title: "Admin Panel - Pixel Print",
  description: "Administrative panel for Pixel Print management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-px-bg">
        <Header />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-6">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

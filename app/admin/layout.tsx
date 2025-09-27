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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col lg:flex-row">
          <AdminSidebar />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

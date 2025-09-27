import { 
  ShoppingCart, 
  DollarSign, 
  Mail, 
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Printer
} from "lucide-react";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import StatsGrid from "@/components/admin/StatsGrid";
import RecentOrders from "@/components/admin/RecentOrders";
import PopularServices from "@/components/admin/PopularServices";
import RecentNotifications from "@/components/admin/RecentNotifications";
import ScrollReveal from "@/components/ux/ScrollReveal";
import { Suspense } from "react";

export default function AdminDashboard() {
  logger.info("=== ADMIN DASHBOARD RENDERED ===");
  logger.info("Admin environment:", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL
  });
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">Admin </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              Dashboard
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-px-muted max-w-2xl mt-4">
            Manage your Pixel Print business operations and track performance
          </p>
        </div>
      </ScrollReveal>

      {/* Stats Grid */}
      <ScrollReveal>
        <StatsGrid />
      </ScrollReveal>

      {/* Recent Orders */}
      <ScrollReveal>
        <RecentOrders />
      </ScrollReveal>




      {/* Additional Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <ScrollReveal>
          <PopularServices />
        </ScrollReveal>

        <ScrollReveal>
          <RecentNotifications />
        </ScrollReveal>
      </div>
    </div>
  );
}
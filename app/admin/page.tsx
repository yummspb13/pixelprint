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
import { Button } from "@/components/ui/button";
import AdminCard from "@/components/admin/AdminCard";
import StatsGrid from "@/components/admin/StatsGrid";
import RecentOrders from "@/components/admin/RecentOrders";
import PopularServices from "@/components/admin/PopularServices";
import RecentNotifications from "@/components/admin/RecentNotifications";
import ScrollReveal from "@/components/ux/ScrollReveal";

export default function AdminDashboard() {
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
          <p className="text-lg text-px-muted max-w-2xl mt-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
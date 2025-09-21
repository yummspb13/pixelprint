'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp 
} from "lucide-react";
import AdminCard from "./AdminCard";

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  conversionRate: number;
  ordersChange: number;
  revenueChange: number;
  customersChange: number;
  conversionChange: number;
}

export default function StatsGrid() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        conversionRate: 0,
        ordersChange: 0,
        revenueChange: 0,
        customersChange: 0,
        conversionChange: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <AdminCard key={i} title="" className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded mb-1 w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard title="Error" className="p-4">
          <div className="text-center text-red-500">
            <p className="text-sm">Error loading stats</p>
          </div>
        </AdminCard>
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Orders",
      value: stats.totalOrders ? stats.totalOrders.toLocaleString() : '0',
      change: `${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange.toFixed(1)}%`,
      changeType: stats.ordersChange >= 0 ? "positive" as const : "negative" as const,
      icon: ShoppingCart,
      color: "cyan"
    },
    {
      title: "Revenue",
      value: `£${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}`,
      change: `${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`,
      changeType: stats.revenueChange >= 0 ? "positive" as const : "negative" as const,
      icon: DollarSign,
      color: "magenta"
    },
    {
      title: "Average Order",
      value: `£${stats.totalRevenue && stats.totalOrders ? (stats.totalRevenue / Math.max(stats.totalOrders, 1)).toFixed(2) : '0.00'}`,
      change: `${stats.conversionChange >= 0 ? '+' : ''}${stats.conversionChange.toFixed(1)}%`,
      changeType: stats.conversionChange >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      color: "yellow"
    },
    {
      title: "Conversion",
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: `${stats.conversionChange >= 0 ? '+' : ''}${stats.conversionChange.toFixed(1)}%`,
      changeType: stats.conversionChange >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      color: "cyan"
    }
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        const colorClasses = {
          cyan: "text-px-cyan bg-px-cyan/10",
          magenta: "text-px-magenta bg-px-magenta/10",
          yellow: "text-px-yellow bg-px-yellow/10"
        };
        
        return (
          <AdminCard key={stat.title} title={stat.title} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-px-muted">{stat.title}</p>
                  <p className="text-lg font-semibold text-px-fg">{stat.value}</p>
                </div>
              </div>
              <span className={`text-xs font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminCard from "@/components/admin/AdminCard";
import StatsGrid from "@/components/admin/StatsGrid";
import ScrollReveal from "@/components/ux/ScrollReveal";

interface AnalyticsData {
  totalRevenue: number;
  newCustomers: number;
  conversionRate: number;
  averageOrder: number;
  revenueChange: number;
  customersChange: number;
  conversionChange: number;
  averageOrderChange: number;
  topServices: Array<{
    name: string;
    orders: number;
    revenue: number;
    growth: number;
  }>;
  recentActivity: Array<{
    action: string;
    user: string;
    time: string;
    type: string;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Business </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Analytics
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Track your business performance and analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchAnalyticsData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Key Metrics */}
      <ScrollReveal>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <AdminCard key={i} title="" className="p-6">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </AdminCard>
            ))}
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminCard title="Total Revenue" className="p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg mb-4 text-px-magenta bg-px-magenta/10">
                  <DollarSign className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-px-muted mb-2">Total Revenue</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-2xl font-semibold text-px-fg">£{analyticsData.totalRevenue.toLocaleString()}</p>
                  <span className={`text-sm font-medium ${analyticsData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.revenueChange >= 0 ? '+' : ''}{analyticsData.revenueChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Total Customers" className="p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg mb-4 text-px-cyan bg-px-cyan/10">
                  <Users className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-px-muted mb-2">Total Customers</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-2xl font-semibold text-px-fg">{analyticsData.newCustomers}</p>
                  <span className={`text-sm font-medium ${analyticsData.customersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.customersChange >= 0 ? '+' : ''}{analyticsData.customersChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Conversion Rate" className="p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg mb-4 text-px-yellow bg-px-yellow/10">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-px-muted mb-2">Conversion Rate</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-2xl font-semibold text-px-fg">{analyticsData.conversionRate.toFixed(1)}%</p>
                  <span className={`text-sm font-medium ${analyticsData.conversionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.conversionChange >= 0 ? '+' : ''}{analyticsData.conversionChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Average Order Value" className="p-6">
              <div className="text-center">
                <div className="inline-flex p-3 rounded-lg mb-4 text-px-cyan bg-px-cyan/10">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-px-muted mb-2">Average Order</p>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-2xl font-semibold text-px-fg">£{analyticsData.averageOrder.toFixed(2)}</p>
                  <span className={`text-sm font-medium ${analyticsData.averageOrderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.averageOrderChange >= 0 ? '+' : ''}{analyticsData.averageOrderChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </AdminCard>
          </div>
        ) : (
          <AdminCard title="Error" className="p-6">
            <div className="text-center text-red-500">
              <p>Error loading analytics data</p>
            </div>
          </AdminCard>
        )}
      </ScrollReveal>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <ScrollReveal>
          <AdminCard title="Revenue by Day" className="h-96">
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-px-muted mx-auto mb-2" />
                <p className="text-px-muted">Revenue Chart</p>
                <p className="text-sm text-px-muted">Chart.js integration ready</p>
              </div>
            </div>
          </AdminCard>
        </ScrollReveal>

        {/* Top Services */}
        <ScrollReveal>
          <AdminCard title="Popular Services" className="h-96">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : analyticsData ? (
              <div className="space-y-4">
                {analyticsData.topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-px-cyan to-px-magenta text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-px-fg">{service.name}</p>
                        <p className="text-sm text-px-muted">{service.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-px-fg">£{service.revenue.toLocaleString()}</p>
                      <p className={`text-sm ${service.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {service.growth >= 0 ? '+' : ''}{service.growth.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-px-muted">
                <p>No data available</p>
              </div>
            )}
          </AdminCard>
        </ScrollReveal>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Analytics */}
        <ScrollReveal>
          <AdminCard title="Customers">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">New Customers</span>
                <span className="text-2xl font-bold text-px-cyan">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Returning Customers</span>
                <span className="text-2xl font-bold text-px-magenta">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average LTV</span>
                <span className="text-2xl font-bold text-px-yellow">£245</span>
              </div>
            </div>
          </AdminCard>
        </ScrollReveal>

        {/* Order Analytics */}
        <ScrollReveal>
          <AdminCard title="Orders">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Orders</span>
                <span className="text-2xl font-bold text-px-cyan">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-2xl font-bold text-px-magenta">1,156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-2xl font-bold text-px-yellow">78</span>
              </div>
            </div>
          </AdminCard>
        </ScrollReveal>

        {/* Recent Activity */}
        <ScrollReveal>
          <AdminCard title="Recent Activity">
            <div className="space-y-3">
              {analyticsData?.recentActivity && analyticsData.recentActivity.length > 0 ? (
                analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'order' ? 'bg-px-cyan' :
                      activity.type === 'completed' ? 'bg-px-magenta' :
                      activity.type === 'customer' ? 'bg-px-yellow' :
                      activity.type === 'email' ? 'bg-px-cyan' : 'bg-gray-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-px-fg">{activity.action}</p>
                      <p className="text-xs text-px-muted">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-20">
                  <p className="text-sm text-px-muted">No recent activity</p>
                </div>
              )}
            </div>
          </AdminCard>
        </ScrollReveal>
      </div>

      {/* Reports */}
      <ScrollReveal>
        <AdminCard title="Reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Calendar className="h-8 w-8 text-px-cyan mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Daily Report</h4>
              <p className="text-sm text-px-muted mb-3">Daily summary</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <BarChart3 className="h-8 w-8 text-px-magenta mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Weekly Report</h4>
              <p className="text-sm text-px-muted mb-3">Weekly analysis</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-px-yellow mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Monthly Report</h4>
              <p className="text-sm text-px-muted mb-3">Full analysis</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Users className="h-8 w-8 text-px-cyan mx-auto mb-2" />
              <h4 className="font-medium text-px-fg mb-1">Customer Report</h4>
              <p className="text-sm text-px-muted mb-3">Customer analysis</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>
    </div>
  );
}
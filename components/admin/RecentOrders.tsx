'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminCard from "./AdminCard";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  quantity: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const statusColors = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  pending: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels = {
  completed: "Completed",
  in_progress: "In Progress", 
  pending: "Pending",
  cancelled: "Cancelled"
};

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/recent-orders');
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminCard title="Recent Orders">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </AdminCard>
    );
  }
  return (
    <AdminCard 
      title="Recent Orders" 
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">View All</Link>
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-px-muted uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-px-muted">
                  No recent orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-px-cyan hover:text-px-magenta transition-colors"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-fg">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-fg">{order.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-fg">{order.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-px-fg">£{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-px-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}
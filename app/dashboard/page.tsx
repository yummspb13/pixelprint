import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, Clock, User, History } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Mock data for demonstration
const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  company: "Acme Corp",
};

const stats = {
  totalOrders: 15,
  completedOrders: 12,
  pendingOrders: 3,
  totalSpent: 1250.75,
};

const recentOrders = [
  { id: "ORD001", date: "2025-09-10", description: "Business Cards (500, Matt Laminated)", status: "Completed", total: 85.50 },
  { id: "ORD002", date: "2025-09-05", description: "A3 Posters (10, Gloss)", status: "Processing", total: 120.00 },
  { id: "ORD003", date: "2025-08-28", description: "Flyers (1000, A5)", status: "Completed", total: 60.20 },
];

export default function DashboardPage() {

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
        <Header />
        
        <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-px-fg mb-2">Dashboard</h1>
          <p className="text-lg text-px-muted">Welcome back, {user.name}!</p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-px-cyan mx-auto mb-4" />
              <CardTitle className="text-xl">Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-px-muted mb-4">Manage your personal information and preferences</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Package className="h-12 w-12 text-px-magenta mx-auto mb-4" />
              <CardTitle className="text-xl">Orders</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-px-muted mb-4">View and manage your current orders</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/orders">View Orders</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <History className="h-12 w-12 text-px-yellow mx-auto mb-4" />
              <CardTitle className="text-xl">Order History</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-px-muted mb-4">View your complete order history</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/orders">View History</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Order Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-px-cyan mb-2">{stats.totalOrders}</div>
                <div className="text-sm text-px-muted">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.completedOrders}</div>
                <div className="text-sm text-px-muted">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingOrders}</div>
                <div className="text-sm text-px-muted">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-px-magenta mb-2">£{stats.totalSpent.toFixed(2)}</div>
                <div className="text-sm text-px-muted">Total Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Recent Orders</CardTitle>
            <Button asChild variant="outline">
              <Link href="/dashboard/orders">View All Orders</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-px-fg text-lg">{order.description}</p>
                    <p className="text-sm text-px-muted">Order ID: {order.id} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-px-cyan text-lg">£{order.total.toFixed(2)}</p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Processing' ? 'bg-orange-100 text-orange-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Search, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryDate: string;
  createdAt: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: number;
  serviceName: string;
  serviceSlug: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  parameters: string;
}

const statusConfig = {
  pending_payment: { 
    label: "Pending Payment", 
    color: "bg-yellow-100 text-yellow-800", 
    icon: Clock 
  },
  pending_review: { 
    label: "Pending Review", 
    color: "bg-blue-100 text-blue-800", 
    icon: AlertCircle 
  },
  confirmed: { 
    label: "Confirmed", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle 
  },
  processing: { 
    label: "Processing", 
    color: "bg-purple-100 text-purple-800", 
    icon: Package 
  },
  completed: { 
    label: "Completed", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle 
  },
  cancelled: { 
    label: "Cancelled", 
    color: "bg-red-100 text-red-800", 
    icon: XCircle 
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    // Try to get email from localStorage or prompt user
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setSearchEmail(savedEmail);
      fetchOrders(savedEmail);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (emailToSearch: string) => {
    if (!emailToSearch) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(emailToSearch)}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
        localStorage.setItem('user_email', emailToSearch);
      } else {
        console.error('Error fetching orders:', data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(searchEmail);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: Clock
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-px-fg mb-2">My Orders</h1>
          <p className="text-lg text-px-muted">Track and manage your orders</p>
        </div>

        {/* Email Search Form */}
        {!email && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Enter Your Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Orders
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-px-cyan mx-auto mb-4"></div>
                <p className="text-px-muted">Loading your orders...</p>
              </div>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-px-fg mb-2">No orders found</h3>
                <p className="text-px-muted mb-6">
                  {email ? `No orders found for ${email}` : 'Enter your email to search for orders'}
                </p>
                <Button asChild>
                  <Link href="/">Browse Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusConfig(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-px-fg mb-1">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-px-muted">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-lg font-bold text-px-cyan mt-1">
                          £{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <h4 className="font-medium text-px-fg mb-2">Items ({order.orderItems.length})</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.serviceName}</p>
                              <p className="text-xs text-px-muted">
                                Qty: {item.quantity} × £{item.unitPrice.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium text-sm">£{item.totalPrice.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-px-muted" />
                        <span className="text-px-muted">Payment:</span>
                        <span className="font-medium capitalize">{order.paymentMethod}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-px-muted" />
                        <span className="text-px-muted">Delivery:</span>
                        <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-px-muted" />
                        <span className="text-px-muted">Status:</span>
                        <span className="font-medium">{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-px-muted">
                        Customer: {order.customerName} ({order.customerEmail})
                      </div>
                      <div className="flex space-x-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/account/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/t/${order.orderNumber}`}>
                            Track Order
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

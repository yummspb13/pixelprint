"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  ArrowLeft,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Truck,
  Loader2,
  User,
  Mail,
  Phone,
  File,
  FileImage
} from "lucide-react";
import { WaveLoader } from "@/components/ui/loaders";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  serviceName: string;
  serviceSlug: string;
  parameters: string; // JSON string
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryDate: string;
  specialInstructions?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostcode?: string;
  deliveryCountry?: string;
  deliveryContactName?: string;
  deliveryContactPhone?: string;
  deliveryCost?: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export default function DashboardOrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchedEmail, setSearchedEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userInfo, setUserInfo] = useState<{name: string; email: string; phone?: string} | null>(null);

  // Load user info from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('pixel-print-user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setUserInfo(user);
          setEmail(user.email);
          // Automatically fetch orders for the logged-in user
          fetchOrders(user.email);
        } catch (error) {
          console.error('Error parsing saved user info:', error);
        }
      }
    }
  }, []);

  const fetchOrders = async (searchEmail: string) => {
    if (!searchEmail) {
      setOrders([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/?email=${searchEmail}`);
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders);
        setSearchedEmail(searchEmail);
      } else {
        toast.error(data.error || "Failed to fetch orders.");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Network error. Failed to fetch orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(email);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment": return "bg-yellow-100 text-yellow-800";
      case "pending_review": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-purple-100 text-purple-800";
      case "processing": return "bg-indigo-100 text-indigo-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_payment": return <Clock className="h-4 w-4" />;
      case "pending_review": return <AlertCircle className="h-4 w-4" />;
      case "confirmed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Truck className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "cancelled": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => 
    statusFilter === "all" || order.status === statusFilter
  );

  return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
        <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-px-fg mb-2">My Orders</h1>
          <p className="text-lg text-px-muted">Track and manage your orders</p>
        </div>

        {/* User Info and Filter */}
        {userInfo ? (
        <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-px-cyan" />
                <span>Welcome back, {userInfo.name}!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-px-muted">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{userInfo.email}</span>
                </div>
                {userInfo.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{userInfo.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-px-muted">
                  Showing {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-px-cyan" />
                <span>Find Your Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Search Orders
                </Button>
              </form>
              
              {searchedEmail && (
                <div className="flex items-center space-x-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_payment">Pending Payment</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-px-muted">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
              </div>
              )}
          </CardContent>
        </Card>
        )}

        {/* Orders List */}
        {(userInfo || searchedEmail) && (
        <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <WaveLoader 
                  size="md" 
                  text="Loading orders..." 
                  className="scale-75"
                />
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-px-fg mb-2">No orders found</h3>
                  <p className="text-px-muted">
                    {statusFilter === "all" 
                      ? "No orders found for this email address."
                      : `No orders found with status "${statusFilter}".`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-px-cyan">
                              {order.orderNumber}
                            </h3>
                            <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                        {getStatusIcon(order.status)}
                              <span>{order.status.replace(/_/g, ' ')}</span>
                    </Badge>
                  </div>
                          <div className="flex items-center space-x-4 text-sm text-px-muted">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CreditCard className="h-4 w-4" />
                              <span>{order.paymentMethod === 'online' ? 'Online Payment' : 'Manager Review'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Truck className="h-4 w-4" />
                              <span>Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                            </div>
                            {order.deliveryCity && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">📍 {order.deliveryCity}</span>
                              </div>
                            )}
                            {order.deliveryCost && (
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">🚚 £{order.deliveryCost.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                  <div className="text-right">
                          <div className="text-2xl font-bold text-px-fg">
                            £{order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-px-muted">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </div>
                  </div>
                </div>

                {/* Order Items */}
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-px-fg mb-3">Order Items:</h4>
                  <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-px-fg">{item.serviceName}</h5>
                                <div className="text-sm text-px-muted">
                                  {Object.entries(JSON.parse(item.parameters)).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {value as string}
                                    </span>
                                  ))}
                                </div>
                                {item.notes && (
                                  <p className="text-sm text-px-muted mt-1">Notes: {item.notes}</p>
                                )}
                                {item.fileName && (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                                    <FileImage className="h-4 w-4 text-green-600" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-green-800 truncate">
                                        {item.fileName}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        {item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                                      </p>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-green-600 border-green-300 hover:bg-green-100"
                                      onClick={() => {
                                        // Download file from server
                                        const downloadUrl = `/api/files/${order.id}/${item.id}`;
                                        const link = document.createElement('a');
                                        link.href = downloadUrl;
                                        link.download = item.fileName || 'file';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        toast.success(`Downloading ${item.fileName}...`);
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-px-fg">
                                  £{item.totalPrice.toFixed(2)}
                                </div>
                                <div className="text-sm text-px-muted">
                            Qty: {item.quantity}
                                </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium text-px-fg mb-2">Special Instructions:</h4>
                          <p className="text-sm text-px-muted bg-zinc-50 p-3 rounded-lg">
                            {order.specialInstructions}
                          </p>
                    </div>
                  )}

                {/* Actions */}
                      <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                      View Details
                            </Link>
                    </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/t/${order.orderNumber}?email=${order.customerEmail}`}>
                              <Truck className="h-4 w-4 mr-2" />
                        Track Order
                            </Link>
                      </Button>
                  </div>
                        <div className="text-sm text-px-muted">
                          Last updated: {new Date(order.updatedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
            )}
          </div>
        )}
      </div>

        <Footer />
      </div>
  );
}
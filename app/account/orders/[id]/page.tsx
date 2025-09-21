"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";

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
  fileName?: string;
  fileSize?: number;
  notes?: string;
}

const statusConfig = {
  pending_payment: { 
    label: "Pending Payment", 
    color: "bg-yellow-100 text-yellow-800", 
    icon: Clock,
    description: "Waiting for payment confirmation"
  },
  pending_review: { 
    label: "Pending Review", 
    color: "bg-blue-100 text-blue-800", 
    icon: AlertCircle,
    description: "Under manager review"
  },
  confirmed: { 
    label: "Confirmed", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle,
    description: "Order confirmed and ready for processing"
  },
  processing: { 
    label: "Processing", 
    color: "bg-purple-100 text-purple-800", 
    icon: Package,
    description: "Order is being processed"
  },
  completed: { 
    label: "Completed", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle,
    description: "Order completed successfully"
  },
  cancelled: { 
    label: "Cancelled", 
    color: "bg-red-100 text-red-800", 
    icon: XCircle,
    description: "Order has been cancelled"
  }
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchOrder(Number(params.id));
    }
  }, [params.id]);

  const fetchOrder = async (orderId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // For now, we'll simulate fetching order details
      // In a real app, this would be an API call
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
      description: "Unknown status"
    };
  };

  const parseParameters = (parametersJson: string) => {
    try {
      return JSON.parse(parametersJson);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-px-cyan mx-auto mb-4"></div>
          <p className="text-px-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-px-fg mb-2">Order Not Found</h2>
                <p className="text-px-muted mb-6">{error || "The order you're looking for doesn't exist."}</p>
                <Button asChild>
                  <Link href="/account/orders">Back to Orders</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusConfig(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/account/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-px-fg mb-2">Order Details</h1>
          <p className="text-lg text-px-muted">Order #{order.orderNumber}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <StatusIcon className="h-5 w-5 text-px-cyan" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={`${statusInfo.color} text-lg px-4 py-2`}>
                      <StatusIcon className="h-4 w-4 mr-2" />
                      {statusInfo.label}
                    </Badge>
                    <p className="text-sm text-px-muted mt-2">{statusInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-px-cyan">£{order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-px-muted">Total Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.orderItems.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.orderItems.map((item) => {
                    const parameters = parseParameters(item.parameters);
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-px-fg text-lg">{item.serviceName}</h4>
                            <p className="text-sm text-px-muted">Service: {item.serviceSlug}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">£{item.totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-px-muted">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        
                        {/* Parameters */}
                        {Object.keys(parameters).length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-px-fg mb-2">Specifications:</h5>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(parameters).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* File Information */}
                        {item.fileName && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-px-fg mb-1">File:</h5>
                            <div className="flex items-center space-x-2 text-sm text-px-muted">
                              <FileText className="h-4 w-4" />
                              <span>{item.fileName}</span>
                              {item.fileSize && (
                                <span>({(item.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-px-fg mb-1">Notes:</h5>
                            <p className="text-sm text-px-muted">{item.notes}</p>
                          </div>
                        )}

                        <div className="border-t pt-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-px-muted">Unit Price:</span>
                            <span className="font-medium">£{item.unitPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-px-muted">{order.specialInstructions}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-px-cyan" />
                  <span>Customer Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-px-muted" />
                  <span className="text-sm">{order.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-px-muted" />
                  <span className="text-sm">{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-px-muted" />
                    <span className="text-sm">{order.customerPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Order Number:</span>
                  <span className="text-sm font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Order Date:</span>
                  <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Payment Method:</span>
                  <span className="text-sm font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Delivery Date:</span>
                  <span className="text-sm font-medium">{formatDate(order.deliveryDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Status:</span>
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/t/${order.orderNumber}`}>
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/account/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

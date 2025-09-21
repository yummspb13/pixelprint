"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  AlertCircle,
  User,
  Mail,
  Phone,
  FileText,
  ArrowLeft
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

export default function TrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const orderNumber = params.orderNumber as string;

  const fetchOrder = async (emailToSearch: string) => {
    if (!emailToSearch || !orderNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call for tracking
      const response = await fetch(`/api/track/${orderNumber}/?email=${encodeURIComponent(emailToSearch)}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setEmail(emailToSearch);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Order not found");
        setOrder(null);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError("Failed to load order details");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchEmail);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-px-fg mb-2">Track Your Order</h1>
          <p className="text-lg text-px-muted">Order #{orderNumber}</p>
        </div>

        {/* Email Verification Form */}
        {!order && !loading && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Verify Your Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Enter the email address used for this order"
                    required
                  />
                  <p className="text-sm text-px-muted mt-1">
                    Enter the email address associated with order #{orderNumber}
                  </p>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Track Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-px-cyan mx-auto mb-4"></div>
                <p className="text-px-muted">Searching for your order...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-px-fg mb-2">Order Not Found</h2>
                <p className="text-px-muted mb-6">{error}</p>
                <div className="space-y-2">
                  <p className="text-sm text-px-muted">
                    Make sure you entered the correct email address and order number.
                  </p>
                  <Button 
                    onClick={() => {
                      setError(null);
                      setSearchEmail("");
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && !loading && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-px-cyan" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const statusInfo = getStatusConfig(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
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
                  );
                })()}
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

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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
                  <span className="text-sm text-px-muted">Expected Delivery:</span>
                  <span className="text-sm font-medium">{formatDate(order.deliveryDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-px-muted">Customer:</span>
                  <span className="text-sm font-medium">{order.customerName}</span>
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

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-px-muted">
                    Need help with your order? Contact our support team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button asChild variant="outline">
                      <Link href="mailto:support@pixelprint.com">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Support
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="tel:+442012345678">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Support
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

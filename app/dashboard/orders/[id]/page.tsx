"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CalendarDays, User, Mail, Phone, FileText, Loader2, CreditCard, Truck, Clock, CheckCircle, AlertCircle, FileImage, Download } from "lucide-react";
import { WaveLoader } from "@/components/ui/loaders";
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

export default function DashboardOrderDetailPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/orders/${id}`);
        const data = await response.json();
        if (response.ok) {
          setOrder(data.order);
        } else {
          toast.error(data.error || "Failed to fetch order details.");
          setOrder(null);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Network error. Failed to fetch order details.");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

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
      case "pending_payment": return <Clock className="h-5 w-5" />;
      case "pending_review": return <AlertCircle className="h-5 w-5" />;
      case "confirmed": return <CheckCircle className="h-5 w-5" />;
      case "processing": return <Truck className="h-5 w-5" />;
      case "completed": return <CheckCircle className="h-5 w-5" />;
      case "cancelled": return <AlertCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <WaveLoader 
          size="lg" 
          text="Loading order details..." 
          className="animate-fade-in"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-px-fg mb-4">Order Not Found</h1>
          <p className="text-lg text-px-muted mb-8">The order you are looking for does not exist or you do not have access.</p>
          <Button asChild>
            <Link href="/dashboard/orders">Back to My Orders</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Orders
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-px-fg">Order #{order.orderNumber}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-px-cyan" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-px-muted">Status:</span>
                  <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.replace(/_/g, ' ')}</span>
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-px-muted">Total Amount:</span>
                  <span className="font-medium text-px-fg">£{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-px-muted">Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod === 'online' ? 'Online Payment' : 'Manager Review'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-px-muted">Order Placed:</span>
                  <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-px-muted">Last Updated:</span>
                  <span className="font-medium">{new Date(order.updatedAt).toLocaleString()}</span>
                </div>
                {order.specialInstructions && (
                  <div>
                    <p className="text-px-muted mb-1">Special Instructions:</p>
                    <p className="font-medium text-px-fg bg-zinc-50 p-3 rounded-lg">{order.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-px-cyan" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-px-muted" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-px-muted" />
                  <span className="font-medium">{order.customerEmail}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-px-muted" />
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-px-cyan" />
                  <span>Order Items ({order.orderItems.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg bg-zinc-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-px-fg">{item.serviceName}</h3>
                      <div className="text-sm text-px-muted mt-1">
                        {Object.entries(JSON.parse(item.parameters)).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value as string}
                          </span>
                        ))}
                      </div>
                      {item.notes && <p className="text-sm text-px-muted mt-1">Notes: {item.notes}</p>}
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
                      <p className="font-bold text-px-fg">£{item.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-px-muted">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Delivery Information */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarDays className="h-5 w-5 text-px-cyan" />
                  <span>Delivery Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-px-muted">Preferred Delivery Date:</p>
                  <p className="font-medium text-px-fg">{new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
                
                {/* Delivery Address */}
                {(order.deliveryAddress || order.deliveryCity || order.deliveryPostcode) && (
                  <div>
                    <p className="text-px-muted mb-2">Delivery Address:</p>
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      {order.deliveryAddress && <p className="font-medium text-px-fg">{order.deliveryAddress}</p>}
                      {(order.deliveryCity || order.deliveryPostcode) && (
                        <p className="text-sm text-px-muted">
                          {[order.deliveryCity, order.deliveryPostcode].filter(Boolean).join(', ')}
                          {order.deliveryCountry && order.deliveryCountry !== 'UK' && `, ${order.deliveryCountry}`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Delivery Contact */}
                {(order.deliveryContactName || order.deliveryContactPhone) && (
                  <div>
                    <p className="text-px-muted mb-2">Delivery Contact:</p>
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      {order.deliveryContactName && <p className="font-medium text-px-fg">{order.deliveryContactName}</p>}
                      {order.deliveryContactPhone && <p className="text-sm text-px-muted">{order.deliveryContactPhone}</p>}
                    </div>
                  </div>
                )}
                
                {/* Delivery Cost */}
                {order.deliveryCost && (
                  <div>
                    <p className="text-px-muted mb-2">Delivery Cost:</p>
                    <div className="bg-zinc-50 p-3 rounded-lg">
                      <p className="font-medium text-px-fg">£{order.deliveryCost.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                <Button asChild className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
                  <Link href={`/t/${order.orderNumber}?email=${order.customerEmail}`}>Track Order Publicly</Link>
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

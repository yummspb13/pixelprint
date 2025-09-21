"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

function PaymentCancelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restoreCart } = useCart();
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number');

  useEffect(() => {
    // Restore cart items if payment was cancelled
    if (typeof window !== 'undefined') {
      const pendingOrder = localStorage.getItem('pixel-print-pending-order');
      if (pendingOrder) {
        try {
          const orderData = JSON.parse(pendingOrder);
          restoreCart(orderData.items);
          localStorage.removeItem('pixel-print-pending-order');
          toast.info("Your items have been restored to your cart.");
        } catch (error) {
          console.error('Error restoring cart:', error);
        }
      }
    }
    
    toast.error("Payment was cancelled. Your items have been restored to your cart.");
  }, [restoreCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-px-fg">
              Payment Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-lg text-px-muted">
                Your payment was cancelled. No charges have been made to your account.
              </p>
              {orderNumber && (
                <p className="text-sm text-px-muted">
                  Order Number: <span className="font-medium text-px-cyan">{orderNumber}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-px-muted">
                Your items have been restored to your cart. You can try again or modify your order.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
                  <Link href="/dashboard/orders">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelPageContent />
    </Suspense>
  );
}

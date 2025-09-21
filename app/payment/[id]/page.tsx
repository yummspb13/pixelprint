"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { toast } from "sonner";

export default function PaymentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (success) {
      setStatus('success');
      toast.success("Payment processed successfully!");
      setTimeout(() => {
        router.push(`/payment/success?order_id=${id}&order_number=ORD-${id}`);
      }, 1500);
    } else {
      setStatus('error');
      toast.error("Payment failed. Please try again.");
      setTimeout(() => {
        router.push(`/payment/cancel?order_id=${id}&order_number=ORD-${id}`);
      }, 1500);
    }
    
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-px-cyan" />
              <span>Payment Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-px-muted">
                Order ID: <span className="font-medium text-px-cyan">ORD-{id}</span>
              </p>
              
              {status === 'pending' && (
                <div className="space-y-4">
                  <p className="text-px-muted">
                    This is a demo payment page. Choose an option to simulate payment:
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => handlePayment(true)}
                      disabled={processing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Simulate Success
                    </Button>
                    
                    <Button 
                      onClick={() => handlePayment(false)}
                      disabled={processing}
                      variant="destructive"
                    >
                      {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Simulate Failure
                    </Button>
                  </div>
                </div>
              )}
              
              {status === 'success' && (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-medium text-green-600">
                    Payment successful! Redirecting...
                  </p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-lg font-medium text-red-600">
                    Payment failed! Redirecting...
                  </p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

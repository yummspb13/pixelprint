"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, ArrowLeft, CreditCard, User, Edit, Trash2, Plus, Minus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Link from "next/link";
import { WaveLoader } from "@/components/ui/loaders";

interface CheckoutData {
  paymentMethod: 'online' | 'manager';
  deliveryDate: string;
  specialInstructions: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryInfo: {
    address: string;
    city: string;
    postcode: string;
    country: string;
    contactName: string;
    contactPhone: string;
  };
}

export default function CheckoutPage() {
  const { items, totalAmount, checkout, clearCart, removeItem, updateQuantity, updateNotes, removeFile, updateFile } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    paymentMethod: 'online',
    deliveryDate: '',
    specialInstructions: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    deliveryInfo: {
      address: '',
      city: '',
      postcode: '',
      country: 'UK',
      contactName: '',
      contactPhone: ''
    }
  });

  // Загрузить данные корзины
  useEffect(() => {
    // Проверить, загружены ли данные из localStorage
    const checkCartLoaded = () => {
      // Если items уже загружены или прошло достаточно времени
      if (items.length > 0 || totalAmount > 0) {
        setIsLoading(false);
      } else {
        // Небольшая задержка для загрузки данных из localStorage
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 200);
        return () => clearTimeout(timer);
      }
    };

    const cleanup = checkCartLoaded();
    return cleanup;
  }, [items.length, totalAmount]);

  // Redirect if cart is empty (only after loading is complete)
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      const timer = setTimeout(() => {
        router.push('/dashboard/orders');
      }, 2000); // Дать время пользователю увидеть сообщение

      return () => clearTimeout(timer);
    }
  }, [isLoading, items.length, router]);

  // Set default delivery date (7 days from now)
  useEffect(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCheckoutData(prev => ({
      ...prev,
      deliveryDate: nextWeek.toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCheckoutData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CheckoutData] as any),
          [child]: value
        }
      }));
    } else {
      setCheckoutData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success("Item removed from cart");
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
    toast.success("Quantity updated");
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    updateNotes(itemId, notes);
  };

  const getProductUrl = (serviceSlug: string) => {
    // Check if it's a static page (like business-cards, postcards, etc.)
    const staticPages = [
      'business-cards', 'postcards', 'leaflets', 'perforating', 'binding', 
      'folding', 'waterproof-menu', 'ncr-pads', 'placemat-menu', 'takeaway-menu',
      'wrapping-paper', 'lamination', 'hole-punching', 'appointment-cards',
      'booklet-printing', 'calendar', 'certificates', 'compliment-slips',
      'drawing-printing', 'envelopes', 'flat-restaurant-menu', 'folded-restaurant-menu',
      'glueing', 'greetings-cards', 'invitations', 'letterheads', 'loyalty-cards',
      'membership-cards', 'order-of-service', 'place-cards', 'photocopying-bw',
      'photocopying-colour', 'rounding-corners', 'stapling', 'thank-you-cards',
      'wedding-stationery'
    ];
    
    if (staticPages.includes(serviceSlug)) {
      return `/services/${serviceSlug}/`;
    } else {
      // For dynamic pages, use the wizard
      return `/services/${serviceSlug}/`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkoutData.contactInfo.name || !checkoutData.contactInfo.email) {
      toast.error("Please fill in all required contact fields");
      return;
    }
    
    if (!checkoutData.deliveryInfo.address || !checkoutData.deliveryInfo.city) {
      toast.error("Please fill in all required delivery fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await checkout(checkoutData);
      
      // Save user info to localStorage for future visits
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixel-print-user', JSON.stringify({
          name: checkoutData.contactInfo.name,
          email: checkoutData.contactInfo.email,
          phone: checkoutData.contactInfo.phone
        }));
      }
      
      toast.success("Order created successfully!");
      
      // Small delay to ensure order is saved before redirect
      setTimeout(() => {
        router.push('/dashboard/orders');
      }, 500);
    } catch (error) {
      toast.error("Failed to create order. Please try again.");
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Показать загрузку пока данные не загружены
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <WaveLoader 
          size="lg" 
          text="Loading your cart..." 
          className="animate-fade-in"
        />
      </div>
    );
  }

  // Показать пустую корзину только после загрузки
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <ShoppingCart className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-px-fg mb-2">Your cart is empty</h2>
          <p className="text-px-muted mb-6">Add some items to proceed to checkout</p>
          <Button asChild>
            <a href="/dashboard/orders">Go to Orders</a>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = totalAmount;
  const shipping = subtotal > 100 ? 0 : 15.00;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <a href="/dashboard/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </a>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-px-fg mb-2">{t('checkout.title')}</h1>
          <p className="text-lg text-px-muted">{t('checkout.completeOrder')}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-px-cyan" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={checkoutData.contactInfo.name}
                      onChange={(e) => handleInputChange('contactInfo.name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={checkoutData.contactInfo.email}
                      onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={checkoutData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                    placeholder="+44 20 1234 5678"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-px-cyan" />
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={checkoutData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Online Payment</div>
                          <div className="text-sm text-px-muted">Pay securely with card</div>
                        </div>
                        <div className="text-sm font-medium text-green-600">Instant</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manager" id="manager" />
                    <Label htmlFor="manager" className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Manager Review</div>
                          <div className="text-sm text-px-muted">We'll contact you to confirm</div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">1-2 days</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={checkoutData.deliveryDate}
                    onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Delivery Address */}
                <div className="space-y-4">
                  <h4 className="font-medium text-px-fg">Delivery Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Address *</Label>
                      <Input
                        id="deliveryAddress"
                        value={checkoutData.deliveryInfo.address}
                        onChange={(e) => handleInputChange('deliveryInfo.address', e.target.value)}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCity">City *</Label>
                      <Input
                        id="deliveryCity"
                        value={checkoutData.deliveryInfo.city}
                        onChange={(e) => handleInputChange('deliveryInfo.city', e.target.value)}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryPostcode">Postcode</Label>
                      <Input
                        id="deliveryPostcode"
                        value={checkoutData.deliveryInfo.postcode}
                        onChange={(e) => handleInputChange('deliveryInfo.postcode', e.target.value)}
                        placeholder="Postcode"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryCountry">Country</Label>
                      <Select
                        value={checkoutData.deliveryInfo.country}
                        onValueChange={(value) => handleInputChange('deliveryInfo.country', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                          <SelectItem value="IT">Italy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={checkoutData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any special requirements or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      {/* Header with service name, price and action buttons */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-px-cyan to-px-magenta rounded-lg flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <Link 
                              href={getProductUrl(item.serviceSlug)}
                              className="group flex items-center space-x-2 hover:text-px-cyan transition-colors"
                            >
                              <h4 className="font-medium text-px-fg group-hover:text-px-cyan">
                                {item.serviceName}
                              </h4>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <p className="text-sm text-px-muted">£{item.unitPrice.toFixed(2)} per unit</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-lg text-px-cyan">£{item.totalPrice.toFixed(2)}</p>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Parameters */}
                      <div className="text-sm text-px-muted mb-3">
                        {Object.entries(item.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-medium">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>

                      {/* File Upload */}
                      <div className="mb-3">
                        {item.fileName ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-green-800 break-words">
                                    {item.fileName}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    ({item.fileSize ? (item.fileSize / 1024 / 1024).toFixed(2) : '0'} MB)
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(item.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 flex-shrink-0 ml-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-4 text-center">
                            <div className="text-sm text-zinc-500 mb-2">
                              Файл не загружен
                            </div>
                            <div className="text-xs text-zinc-400 mb-3">
                              Загрузите файл дизайна (до 50MB)
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.ai,.eps,.psd"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 50 * 1024 * 1024) {
                                      toast.error('File size must be less than 50MB');
                                      return;
                                    }
                                    updateFile(item.id, file);
                                    toast.success(`File "${file.name}" uploaded`);
                                  }
                                }}
                                className="text-xs"
                              />
                              <div className="text-xs text-zinc-400">
                                или{' '}
                                <Link 
                                  href={getProductUrl(item.serviceSlug)}
                                  className="text-px-cyan hover:text-px-magenta transition-colors"
                                >
                                  перейти к калькулятору
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-px-muted">Количество:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 1;
                              if (newQuantity >= 1) {
                                handleQuantityChange(item.id, newQuantity);
                              }
                            }}
                            className="w-16 h-8 text-center text-sm font-medium"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-px-muted">Примечания к заказу:</label>
                        <Textarea
                          value={item.notes || ''}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          placeholder="Особые требования, цветовые предпочтения и т.д."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-px-muted">Subtotal</span>
                    <span className="font-medium">£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-px-muted">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Free</span>
                      ) : (
                        `£${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-px-cyan">£{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {checkoutData.paymentMethod === 'online' ? 'Pay Now' : 'Submit Order'}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-px-muted">
                    {checkoutData.paymentMethod === 'online' 
                      ? 'Secure payment processing' 
                      : 'We\'ll contact you within 1-2 business days'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

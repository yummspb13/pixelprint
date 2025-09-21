"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  Calculator, 
  Send, 
  CheckCircle, 
  Clock, 
  Shield, 
  Star,
  ArrowRight,
  Download,
  Eye,
  Zap,
  ShoppingCart
} from "lucide-react";
import ScrollReveal from "@/components/ux/ScrollReveal";
import { motion } from "framer-motion";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { useCart } from "@/contexts/CartContext";

interface ServiceOption {
  value: string;
  label: string;
  price: number;
}

interface ServicePageTemplateProps {
  // Service Information
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  category: string;
  
  // Features
  features: Array<{
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    color: string;
  }>;
  
  // Calculator Options
  quantityLabel: string;
  options: Array<{
    key: string;
    label: string;
    values: ServiceOption[];
  }>;
  
  // File Upload
  acceptFormats: string;
  maxFileSize?: number;
  
  // Pricing
  basePrice: number;
  calculatePrice: (quantity: number, selections: Record<string, string>) => number;
  
  // Order Processing
  onOrderSubmit: (files: File[], selections: Record<string, string>, quantity: number) => Promise<void>;
}

export default function ServicePageTemplate({
  title,
  subtitle,
  description,
  heroImage,
  category,
  features,
  quantityLabel,
  options,
  acceptFormats,
  maxFileSize = 10, // MB
  basePrice,
  calculatePrice,
  onOrderSubmit
}: ServicePageTemplateProps) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [quote, setQuote] = useState<{ net: number; vat: number; total: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem, openCart } = useCart() || { addItem: () => {}, openCart: () => {} };

  // Initialize default selections
  useState(() => {
    const defaultSelections: Record<string, string> = {};
    options.forEach(option => {
      if (option.values.length > 0) {
        defaultSelections[option.key] = option.values[0].value;
      }
    });
    setSelections(defaultSelections);
  });

  const calculateQuote = async () => {
    setIsCalculating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const net = calculatePrice(quantity, selections);
      const vat = net * 0.2;
      const total = net + vat;
      
      setQuote({ net, vat, total });
      toast.success("Quote calculated successfully!");
    } catch (error) {
      toast.error("Failed to calculate quote");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Check file size
    const oversizedFiles = files.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed ${maxFileSize}MB limit`);
      return;
    }
    
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) uploaded`);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitOrder = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload files first");
      return;
    }
    
    setIsUploading(true);
    try {
      await onOrderSubmit(uploadedFiles, selections, quantity);
      toast.success("Order submitted successfully!");
      setUploadedFiles([]);
      setQuote(null);
    } catch (error) {
      toast.error("Failed to submit order");
    } finally {
      setIsUploading(false);
    }
  };

  const addToCart = () => {
    if (!quote) {
      toast.error("Please calculate price first");
      return;
    }

    const parameters: Record<string, string> = {};
    options.forEach(option => {
      const selectedValue = selections[option.key];
      if (selectedValue) {
        const optionValue = option.values.find(v => v.value === selectedValue);
        parameters[option.label] = optionValue?.label || selectedValue;
      }
    });

    addItem({
      serviceName: title,
      serviceSlug: title.toLowerCase().replace(/\s+/g, '-'),
      parameters,
      quantity,
      unitPrice: quote.net,
      uploadedFile: uploadedFiles[0],
      fileName: uploadedFiles[0]?.name,
      fileSize: uploadedFiles[0]?.size,
    });

    toast.success("Added to cart!");
    openCart();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      {/* Hero Section */}
      <ScrollReveal>
        <div className="relative overflow-hidden bg-gradient-to-r from-px-cyan/10 via-px-magenta/5 to-px-yellow/10">
          {heroImage && (
            <div className="absolute inset-0 bg-[url('/hero/hero-main.jpg')] bg-cover bg-center opacity-20"></div>
          )}
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <Badge className="bg-gradient-to-r from-px-cyan to-px-magenta text-white px-4 py-2 text-sm font-medium">
                  {category}
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight font-playfair">
                  <span className="text-px-fg">{title}</span>
                </h1>
                
                <p className="text-xl text-px-muted max-w-3xl mx-auto leading-relaxed">
                  {description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <div className="flex items-center space-x-2 text-px-muted">
                    <CheckCircle className="h-5 w-5 text-px-cyan" />
                    <span>Professional Quality</span>
                  </div>
                  <div className="flex items-center space-x-2 text-px-muted">
                    <Clock className="h-5 w-5 text-px-cyan" />
                    <span>Fast Turnaround</span>
                  </div>
                  <div className="flex items-center space-x-2 text-px-muted">
                    <Shield className="h-5 w-5 text-px-cyan" />
                    <span>Secure Processing</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Features Section */}
      <ScrollReveal>
        <div className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-px-fg mb-4">
                Why Choose Our {subtitle}?
              </h2>
              <p className="text-lg text-px-muted max-w-2xl mx-auto">
                Professional-grade equipment and expertise for all your {subtitle.toLowerCase()} needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-px-cyan/5 to-px-cyan/10 border border-px-cyan/20"
                >
                  <div className={`w-16 h-16 bg-${feature.color}/10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-px-fg mb-2">{feature.title}</h3>
                  <p className="text-px-muted">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Calculator Section */}
      <ScrollReveal>
        <div className="py-16 bg-gradient-to-br from-zinc-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-px-fg mb-4">
                <Calculator className="inline h-8 w-8 mr-3 text-px-cyan" />
                Get Your Quote
              </h2>
              <p className="text-lg text-px-muted">
                Configure your requirements and get an instant price estimate
              </p>
            </div>
            
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10 border-b border-px-cyan/20">
                <CardTitle className="text-2xl font-bold text-px-fg text-center">
                  {subtitle} Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-px-fg">{quantityLabel}</label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                      placeholder="Enter quantity"
                    />
                  </div>
                  
                  {/* Options */}
                  {options.map((option) => (
                    <div key={option.key} className="space-y-2">
                      <label className="text-sm font-medium text-px-fg">{option.label}</label>
                      <Select 
                        value={selections[option.key]} 
                        onValueChange={(value) => setSelections(prev => ({ ...prev, [option.key]: value }))}
                      >
                        <SelectTrigger className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {option.values.map((value) => (
                            <SelectItem key={value.value} value={value.value}>
                              {value.label} {value.price > 0 && `(+£${value.price.toFixed(2)})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button
                    onClick={calculateQuote}
                    disabled={isCalculating}
                    className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {isCalculating ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-5 w-5 mr-2" />
                        Calculate Quote
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Quote Results */}
                {quote && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gradient-to-r from-px-cyan/5 to-px-magenta/5 rounded-xl p-6 border border-px-cyan/20"
                  >
                    <h3 className="text-xl font-semibold text-px-fg mb-4 text-center">Quote Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-px-muted">Net Amount:</span>
                        <span className="font-semibold">£{quote.net.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="text-px-muted">VAT (20%):</span>
                        <span className="font-semibold">£{quote.vat.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-px-cyan/20 pt-3">
                        <div className="flex justify-between text-xl font-bold text-px-fg">
                          <span>Total:</span>
                          <span className="text-px-cyan">£{quote.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* File Upload Section */}
      <ScrollReveal>
        <div className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-px-fg mb-4">
                <Upload className="inline h-8 w-8 mr-3 text-px-cyan" />
                Upload Your Files
              </h2>
              <p className="text-lg text-px-muted">
                Upload your files for processing. We accept {acceptFormats} formats.
              </p>
            </div>
            
            <Card className="shadow-xl border-0 bg-gradient-to-br from-zinc-50 to-white">
              <CardContent className="p-8">
                <div className="border-2 border-dashed border-px-cyan/30 rounded-xl p-8 text-center hover:border-px-cyan/50 transition-colors">
                  <Upload className="h-16 w-16 text-px-cyan mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-px-fg mb-2">Drop your files here</h3>
                  <p className="text-px-muted mb-6">or click to browse (max {maxFileSize}MB per file)</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptFormats}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white px-6 py-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
                
                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-px-fg mb-4">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-px-cyan" />
                            <span className="text-px-fg">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* Order Submission */}
      <ScrollReveal>
        <div className="py-16 bg-gradient-to-r from-px-cyan/10 via-px-magenta/5 to-px-yellow/10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-px-fg mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-px-muted mb-8">
              Submit your order and we'll process your files within 24 hours
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={addToCart}
                disabled={!quote}
                variant="outline"
                className="border-2 border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                onClick={submitOrder}
                disabled={uploadedFiles.length === 0 || isUploading}
                className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white px-12 py-4 text-xl font-semibold shadow-xl"
              >
                {isUploading ? (
                  <>
                    <Clock className="h-6 w-6 mr-3 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6 mr-3" />
                    Submit Order to Print Shop
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </>
                )}
              </Button>
            </div>
            
            {uploadedFiles.length === 0 && (
              <p className="text-sm text-px-muted mt-4">
                Please upload files before submitting your order
              </p>
            )}
          </div>
        </div>
      </ScrollReveal>
      
      <Footer />
    </div>
  );
}

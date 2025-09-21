"use client";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { Zap, Eye, Shield } from "lucide-react";

export default function A3DocumentScanningPage() {
  const scanQualities = [
    { value: "standard", label: "Standard (300 DPI)", price: 0.15 },
    { value: "high", label: "High (600 DPI)", price: 0.25 },
    { value: "ultra", label: "Ultra (1200 DPI)", price: 0.45 }
  ];

  const fileFormats = [
    { value: "pdf", label: "PDF", price: 0 },
    { value: "jpg", label: "JPG", price: 0 },
    { value: "tiff", label: "TIFF", price: 0.05 },
    { value: "png", label: "PNG", price: 0.02 }
  ];

  const deliveryMethods = [
    { value: "email", label: "Email Delivery", price: 0 },
    { value: "cloud", label: "Cloud Storage", price: 2.00 },
    { value: "usb", label: "USB Drive", price: 5.00 },
    { value: "cd", label: "CD/DVD", price: 3.00 }
  ];

  const calculatePrice = (quantity: number, selections: Record<string, string>) => {
    const qualityPrice = scanQualities.find(q => q.value === selections.scanQuality)?.price || 0;
    const formatPrice = fileFormats.find(f => f.value === selections.fileFormat)?.price || 0;
    const deliveryPrice = deliveryMethods.find(d => d.value === selections.deliveryMethod)?.price || 0;
    
    return quantity * (qualityPrice + formatPrice) + deliveryPrice;
  };

  const handleOrderSubmit = async (files: File[], selections: Record<string, string>, quantity: number) => {
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Order submitted:", { files, selections, quantity });
  };

  return (
    <ServicePageTemplate
      title="A3 Document Scanning"
      subtitle="Professional A3 Scanning Service"
      description="Transform your physical documents into high-quality digital files with our professional A3 scanning service. Perfect for blueprints, architectural drawings, large format documents, and more."
      heroImage="/hero/hero-main.jpg"
      category="Professional Document Services"
      features={[
        {
          icon: Zap,
          title: "Lightning Fast",
          description: "Process up to 100 A3 documents per hour with our high-speed scanners",
          color: "px-cyan"
        },
        {
          icon: Eye,
          title: "Crystal Clear",
          description: "Up to 1200 DPI scanning resolution for perfect detail reproduction",
          color: "px-magenta"
        },
        {
          icon: Shield,
          title: "Secure & Safe",
          description: "Your documents are handled with utmost care and confidentiality",
          color: "px-yellow"
        }
      ]}
      quantityLabel="Number of Documents"
      options={[
        {
          key: "scanQuality",
          label: "Scan Quality",
          values: scanQualities
        },
        {
          key: "fileFormat",
          label: "Output Format",
          values: fileFormats
        },
        {
          key: "deliveryMethod",
          label: "Delivery Method",
          values: deliveryMethods
        }
      ]}
      acceptFormats=".pdf,.jpg,.jpeg,.png,.tiff"
      maxFileSize={50}
      basePrice={0.15}
      calculatePrice={calculatePrice}
      onOrderSubmit={handleOrderSubmit}
    />
  );
}

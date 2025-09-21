"use client";
import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { Star, Palette, Clock } from "lucide-react";

export default function BusinessCardPrintingPage() {
  const paperTypes = [
    { value: "standard", label: "Standard (300gsm)", price: 0 },
    { value: "premium", label: "Premium (400gsm)", price: 0.05 },
    { value: "luxury", label: "Luxury (500gsm)", price: 0.15 }
  ];

  const finishes = [
    { value: "matte", label: "Matte Finish", price: 0 },
    { value: "gloss", label: "Gloss Finish", price: 0.02 },
    { value: "spot", label: "Spot UV", price: 0.10 },
    { value: "foil", label: "Foil Stamping", price: 0.25 }
  ];

  const rushOptions = [
    { value: "standard", label: "Standard (5-7 days)", price: 0 },
    { value: "rush", label: "Rush (2-3 days)", price: 0.20 },
    { value: "express", label: "Express (24 hours)", price: 0.50 }
  ];

  const calculatePrice = (quantity: number, selections: Record<string, string>) => {
    const paperPrice = paperTypes.find(p => p.value === selections.paperType)?.price || 0;
    const finishPrice = finishes.find(f => f.value === selections.finish)?.price || 0;
    const rushPrice = rushOptions.find(r => r.value === selections.rush)?.price || 0;
    
    // Base price per card
    const basePrice = 0.15;
    const pricePerCard = basePrice + paperPrice + finishPrice + rushPrice;
    
    return quantity * pricePerCard;
  };

  const handleOrderSubmit = async (files: File[], selections: Record<string, string>, quantity: number) => {
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Business card order submitted:", { files, selections, quantity });
  };

  return (
    <ServicePageTemplate
      title="Business Card Printing"
      subtitle="Professional Business Card Printing"
      description="Create stunning business cards that make a lasting impression. From classic designs to modern finishes, we offer premium quality printing with fast turnaround times."
      heroImage="/hero/hero-main.jpg"
      category="Professional Printing Services"
      features={[
        {
          icon: Star,
          title: "Premium Quality",
          description: "High-quality printing with crisp text and vibrant colors on premium cardstock",
          color: "px-cyan"
        },
        {
          icon: Palette,
          title: "Custom Finishes",
          description: "Choose from matte, gloss, spot UV, or foil stamping for a unique look",
          color: "px-magenta"
        },
        {
          icon: Clock,
          title: "Fast Turnaround",
          description: "Get your business cards printed and delivered in as little as 24 hours",
          color: "px-yellow"
        }
      ]}
      quantityLabel="Number of Cards"
      options={[
        {
          key: "paperType",
          label: "Paper Type",
          values: paperTypes
        },
        {
          key: "finish",
          label: "Finish",
          values: finishes
        },
        {
          key: "rush",
          label: "Delivery Speed",
          values: rushOptions
        }
      ]}
      acceptFormats=".pdf,.ai,.eps,.jpg,.png"
      maxFileSize={25}
      basePrice={0.15}
      calculatePrice={calculatePrice}
      onOrderSubmit={handleOrderSubmit}
    />
  );
}

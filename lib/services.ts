// Pixel Print London Typography - Services Data
// Single source of truth for all service categories, sub-items, and routes

import {
  Briefcase, Megaphone, Ruler, UtensilsCrossed, Copy as CopyIcon,
  BookOpen, PartyPopper, TreePine, Layers, Scissors
} from "lucide-react";

export type SubItem = { 
  name: string; 
  slug: string; 
  path: string; 
  calc?: string; 
};

export type Category = { 
  key: string; 
  label: string; 
  path: string; 
  icon: any; 
  items: SubItem[]; 
};

export const CATEGORIES: Category[] = [
  {
    key: "business-stationery",
    label: "Business Stationery",
    path: "/services/business-stationery",
    icon: Briefcase,
    items: [
      { name: "Letterheads", slug: "letterheads", path: "/services/letterheads", calc: "/services/letterheads" },
      { name: "Certificates", slug: "certificates", path: "/services/certificates" },
      { name: "Compliment slips", slug: "compliment-slips", path: "/services/compliment-slips" },
      { name: "Business cards", slug: "business-cards", path: "/services/business-cards", calc: "/services/business-cards" },
      { name: "Appointment cards", slug: "appointment-cards", path: "/services/appointment-cards" },
      { name: "Loyalty cards", slug: "loyalty-cards", path: "/services/loyalty-cards" },
      { name: "NCR pads A4 triple (50)", slug: "ncr-a4-triple", path: "/services/ncr-a4-triple" },
      { name: "Overprint envelopes BW", slug: "overprint-envelopes-bw", path: "/services/overprint-envelopes-bw" },
      { name: "Membership cards", slug: "membership-cards", path: "/services/membership-cards" }
    ]
  },
  {
    key: "advertising",
    label: "Advertising",
    path: "/services/advertising",
    icon: Megaphone,
    items: [
      { name: "Flyers", slug: "flyers", path: "/services/flyers", calc: "/services/flyers" },
      { name: "Leaflets printing", slug: "leaflets", path: "/services/leaflets", calc: "/services/leaflets" },
      { name: "Posters", slug: "posters", path: "/services/posters", calc: "/services/posters" },
    ]
  },
  {
    key: "large-format",
    label: "Large Format Printing",
    path: "/services/large-format",
    icon: Ruler,
    items: [
      { name: "Drawing printing", slug: "drawing-printing", path: "/services/drawing-printing" },
      { name: "Poster printing", slug: "poster-printing", path: "/services/poster-printing", calc: "/services/poster-printing" },
    ]
  },
  {
    key: "menu-printing",
    label: "Menu Printing",
    path: "/services/menu-printing",
    icon: UtensilsCrossed,
    items: [
      { name: "Waterproof menu", slug: "waterproof-menu", path: "/services/waterproof-menu" },
      { name: "Flat restaurant menu", slug: "flat-menu", path: "/services/flat-menu" },
      { name: "Folded restaurant menu", slug: "folded-menu", path: "/services/folded-menu" },
      { name: "Placemat menu", slug: "placemat-menu", path: "/services/placemat-menu" },
      { name: "Takeaway menu", slug: "takeaway-menu", path: "/services/takeaway-menu" },
    ]
  },
  {
    key: "photocopying",
    label: "Photocopying",
    path: "/services/photocopying",
    icon: CopyIcon,
    items: [
      { name: "B/W", slug: "photocopying-bw", path: "/services/photocopying-bw", calc: "/services/photocopying-bw" },
      { name: "Colour", slug: "photocopying-colour", path: "/services/photocopying-colour", calc: "/services/photocopying-colour" },
    ]
  },
  {
    key: "booklet-printing",
    label: "Booklet Printing",
    path: "/services/booklet-printing",
    icon: BookOpen,
    items: [
      { name: "A6–A4", slug: "booklet-a6-a4", path: "/services/booklet-a6-a4", calc: "/services/booklet-a6-a4" },
    ]
  },
  {
    key: "events-printing",
    label: "Events Printing",
    path: "/services/events-printing",
    icon: PartyPopper,
    items: [
      { name: "Wedding stationery", slug: "wedding-stationery", path: "/services/wedding-stationery" },
      { name: "Order of service", slug: "order-of-service", path: "/services/order-of-service" },
      { name: "Poster printing", slug: "events-poster-printing", path: "/services/events-poster-printing", calc: "/services/events-poster-printing" },
      { name: "Invitations", slug: "invitations", path: "/services/invitations" },
      { name: "Place cards", slug: "place-cards", path: "/services/place-cards" },
      { name: "\"Thank you\" cards", slug: "thank-you-cards", path: "/services/thank-you-cards" },
    ]
  },
  {
    key: "seasonal-printing",
    label: "Seasonal Printing",
    path: "/services/seasonal-printing",
    icon: TreePine,
    items: [
      { name: "Greetings cards", slug: "greetings-cards", path: "/services/greetings-cards" },
      { name: "Postcards", slug: "postcards", path: "/services/postcards" },
      { name: "Wrapping paper", slug: "wrapping-paper", path: "/services/wrapping-paper" },
      { name: "Calendar", slug: "calendar", path: "/services/calendar" },
    ]
  },
  {
    key: "laminating",
    label: "Laminating",
    path: "/services/laminating",
    icon: Layers,
    items: [
      { name: "A5–A1", slug: "laminating-a5-a1", path: "/services/laminating-a5-a1", calc: "/services/laminating-a5-a1" },
    ]
  },
  {
    key: "finishing",
    label: "Print Finishing Services",
    path: "/services/print-finishing",
    icon: Scissors,
    items: [
      { name: "Binding", slug: "binding", path: "/services/binding" },
      { name: "Hole punching", slug: "hole-punching", path: "/services/hole-punching" },
      { name: "Perforating", slug: "perforating", path: "/services/perforating" },
      { name: "Rounding corners", slug: "rounding-corners", path: "/services/rounding-corners" },
      { name: "Glueing", slug: "glueing", path: "/services/glueing" },
      { name: "Folding", slug: "folding", path: "/services/folding" },
      { name: "Stapling", slug: "stapling", path: "/services/stapling" },
    ]
  },
];
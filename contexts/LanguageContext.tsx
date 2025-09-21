'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language to localStorage when it changes
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    // Import translations based on current language
    let translations: any = {};
    
    try {
      if (language === 'es') {
        translations = {
          "header": {
            "title": "Pixel Print",
            "search": "Buscar servicios o CMD+K",
            "cart": "Carrito de Compras",
            "login": "Iniciar Sesión",
            "register": "Registrarse",
            "account": "Mi Cuenta",
            "logout": "Cerrar Sesión",
            "menu": "Menú",
            "navigation": {
              "about": "Acerca de",
              "services": "Servicios",
              "urgent": "Urgente",
              "faq": "Preguntas",
              "contacts": "Contactos"
            }
          },
          "hero": {
            "title": "Impresión Digital Premium y Gran Formato",
            "subtitle": "en Londres",
            "description": "Papelería empresarial, folletos, carteles, libretos, menús. Preflight experto, opciones el mismo día, pago seguro.",
            "calculateOrder": "Calcular Pedido",
            "uploadArtwork": "Subir Arte",
            "callNow": "Llamar",
            "quickQuote": "Cotización",
            "chooseService": "Elige un servicio abajo y cantidad, luego haz clic en Cotización rápida"
          },
          "cart": {
            "title": "Carrito de Compras",
            "empty": "Tu carrito está vacío",
            "item": "Artículo",
            "quantity": "Cantidad",
            "price": "Precio",
            "total": "Total",
            "subtotal": "Subtotal",
            "vat": "IVA (20%)",
            "grandTotal": "Total General",
            "remove": "Eliminar",
            "goToCalculator": "ir al calculador",
            "checkout": "Proceder al Pago",
            "continueShopping": "Continuar Comprando"
          },
          "checkout": {
            "title": "Pago",
            "completeOrder": "Completa tu pedido",
            "billingInfo": "Información de Facturación",
            "deliveryInfo": "Información de Entrega",
            "paymentMethod": "Método de Pago",
            "orderSummary": "Resumen del Pedido",
            "firstName": "Nombre",
            "lastName": "Apellido",
            "email": "Correo Electrónico",
            "phone": "Teléfono",
            "address": "Dirección",
            "city": "Ciudad",
            "postcode": "Código Postal",
            "country": "País",
            "cardNumber": "Número de Tarjeta",
            "expiryDate": "Fecha de Vencimiento",
            "cvv": "CVV",
            "placeOrder": "Realizar Pedido",
            "sameAsBilling": "Igual que la información de facturación"
          },
          "services": {
            "title": "Nuestros Servicios",
            "subtitle": "Soluciones de impresión profesional para tu negocio",
            "viewDetails": "Ver Detalles",
            "calculatePrice": "Calcular Precio",
            "popular": "Popular",
            "categories": {
              "businessStationery": "Papelería Empresarial",
              "marketingMaterials": "Materiales de Marketing",
              "largeFormat": "Gran Formato",
              "digitalPrinting": "Impresión Digital"
            },
            "names": {
              "business-cards": "Tarjetas de Presentación",
              "flyers": "Folletos",
              "leaflets": "Hojas Volantes",
              "posters": "Carteles",
              "booklet-printing": "Impresión de Libretos",
              "appointment-cards": "Tarjetas de Cita",
              "letterheads": "Membrete",
              "certificates": "Certificados",
              "compliment-slips": "Notas de Agradecimiento",
              "loyalty-cards": "Tarjetas de Fidelidad",
              "brochures": "Folleteros",
              "business-stationery": "Papelería Empresarial",
              "menus": "Menús",
              "booklets": "Libretos",
              "banners": "Banderas",
              "signs": "Señales",
              "labels": "Etiquetas",
              "stickers": "Pegatinas",
              "invitations": "Invitaciones",
              "presentations": "Presentaciones",
              "catalogs": "Catálogos",
              "drawing-printing": "Impresión de Dibujos",
              "envelopes": "Sobres",
              "a3-document-scanning": "Escaneo de Documentos A3",
              "business-card-printing": "Impresión de Tarjetas de Presentación",
              "binding": "Encuadernación",
              "calendar": "Calendarios",
              "event-posters": "Carteles de Eventos",
              "flat-restaurant-menu": "Menú de Restaurante Plano",
              "folded-restaurant-menu": "Menú de Restaurante Plegado",
              "folding": "Plegado",
              "glueing": "Pegado",
              "greetings-cards": "Tarjetas de Saludo",
              "hole-punching": "Perforado",
              "lamination": "Laminado",
              "lamination-a5-a1": "Laminado A5-A1",
              "membership-cards": "Tarjetas de Membresía",
              "ncr-pads": "Blocs NCR",
              "order-of-service": "Orden de Servicio",
              "overprint-envelopes": "Sobres con Sobreimpresión",
              "perforating": "Perforado",
              "photocopying-bw": "Fotocopiado B/N",
              "photocopying-colour": "Fotocopiado Color",
              "place-cards": "Tarjetas de Lugar",
              "placemat-menu": "Menú de Mantel",
              "postcards": "Postales",
              "poster-printing": "Impresión de Carteles",
              "poster-printing-large": "Carteles Grandes",
              "rounding-corners": "Redondeo de Esquinas",
              "stapling": "Grapado",
              "takeaway-menu": "Menú para Llevar",
              "thank-you-cards": "Tarjetas de Agradecimiento",
              "waterproof-menu": "Menú Impermeable",
              "wedding-stationery": "Papelería de Boda",
              "wrapping-paper": "Papel de Regalo"
            }
          },
          "why": {
            "title": "¿Por qué elegir Pixel Print?",
            "subtitle": "Excelencia en cada proyecto de impresión",
            "articles": {
              "same-day-turnaround": {
                "title": "Entrega el Mismo Día",
                "description": "Servicio de impresión urgente para proyectos que no pueden esperar"
              },
              "premium-quality": {
                "title": "Calidad Premium",
                "description": "Materiales de primera calidad y tecnología de impresión avanzada"
              },
              "expert-preflight": {
                "title": "Preflight Experto",
                "description": "Revisión profesional de archivos antes de la impresión"
              },
              "secure-checkout": {
                "title": "Pago Seguro",
                "description": "Proceso de pago protegido y confiable"
              },
              "professional-service": {
                "title": "Servicio Profesional",
                "description": "Atención al cliente experta y personalizada"
              },
              "fast-delivery": {
                "title": "Entrega Rápida",
                "description": "Envío rápido y confiable a toda Londres"
              }
            }
          },
          "contact": {
            "title": "Ponte en Contacto",
            "subtitle": "Estamos aquí para ayudarte con tu próximo proyecto",
            "name": "Nombre",
            "email": "Correo Electrónico",
            "phone": "Teléfono",
            "message": "Mensaje",
            "sendMessage": "Enviar Mensaje",
            "address": "Dirección",
            "workingHours": "Horario de Atención",
            "fillRequiredFields": "Por favor completa todos los campos requeridos",
            "thankYouMessage": "¡Gracias por tu mensaje! Te responderemos pronto.",
            "quickQuoteDescription": "Obtén una cotización instantánea para tus necesidades de impresión usando nuestra calculadora en línea.",
            "calculateNow": "Calcular Ahora",
            "messagePlaceholder": "Cuéntanos sobre tus necesidades de impresión..."
          },
          "footer": {
            "description": "Servicios de tipografía e impresión líderes en Londres. Calidad profesional, servicio excepcional y soluciones innovadoras para todas tus necesidades de impresión.",
            "services": "Servicios",
            "quickLinks": "Enlaces Rápidos",
            "contact": "Contacto",
            "aboutUs": "Acerca de Nosotros",
            "pricing": "Precios",
            "calculateQuote": "Calcular Cotización",
            "uploadArtwork": "Subir Arte",
            "getQuote": "Obtener Cotización",
            "copyright": "© 2024 Pixel Print London. Todos los derechos reservados.",
            "privacyPolicy": "Política de Privacidad",
            "termsOfService": "Términos de Servicio"
          },
          "commandPalette": {
            "title": "Buscar Servicios y Calculadoras",
            "placeholder": "Buscar servicios o calculadoras...",
            "noResults": "Sin resultados.",
            "services": "Servicios"
          },
          "common": {
            "loading": "Cargando...",
            "error": "Error",
            "success": "Éxito",
            "save": "Guardar",
            "cancel": "Cancelar",
            "edit": "Editar",
            "delete": "Eliminar",
            "close": "Cerrar",
            "back": "Atrás",
            "next": "Siguiente",
            "previous": "Anterior",
            "submit": "Enviar",
            "reset": "Restablecer",
            "search": "Buscar",
            "filter": "Filtrar",
            "sort": "Ordenar",
            "view": "Ver",
            "download": "Descargar",
            "upload": "Subir",
            "select": "Seleccionar",
            "choose": "Elegir",
            "required": "Requerido",
            "optional": "Opcional",
            "showLess": "Mostrar Menos",
            "moreServices": "más servicios",
            "showAllServices": "Mostrar Todos los Servicios",
            "noArticlesFound": "No se encontraron artículos",
            "visitPage": "Visitar página",
            "learnMore": "Saber más"
          },
          "service": {
            "quantity": "Cantidad",
            "turnaround": "Tiempo de Entrega",
            "delivery": "Entrega",
            "uploadArtwork": "Subir Arte",
            "uploadedFiles": "Archivos Subidos",
            "addToCart": "Agregar al Carrito",
            "getQuote": "Obtener Cotización",
            "calculatePrice": "Calcular Precio",
            "standard": "Estándar",
            "express": "Express",
            "pickup": "Recoger",
            "courier": "Mensajería",
            "features": {
              "fastTurnaround": "Entrega Rápida",
              "flexibleDelivery": "Entrega Flexible",
              "secureCheckout": "Pago Seguro",
              "premiumQuality": "Calidad Premium",
              "secureProcessing": "Procesamiento Seguro"
            },
            "messages": {
              "serviceNotFound": "Servicio No Encontrado",
              "serviceNotFoundDesc": "El servicio que buscas no existe.",
              "viewAllServices": "Ver Todos los Servicios",
              "whyChoose": "¿Por qué elegir nuestros",
              "professionalPrinting": "Servicios de impresión profesional con atención al detalle",
              "calculateOrder": "Calcular tu Pedido",
              "configureService": "Configura tu",
              "getInstantQuote": "y obtén una cotización instantánea",
              "chooseOption": "Elegir",
              "dropFiles": "Arrastra archivos aquí o haz clic para explorar",
              "selectOptions": "Selecciona opciones para ver precios",
              "proceedCheckout": "Proceder al Pago",
              "addedToCart": "¡Agregado al carrito!",
              "calculateFirst": "Por favor calcula el precio primero",
              "failedCalculate": "Error al calcular el precio"
            }
          }
        };
      } else {
        translations = {
          "header": {
            "title": "Pixel Print",
            "search": "Search services or CMD+K",
            "cart": "Shopping Cart",
            "login": "Login",
            "register": "Register",
            "account": "My Account",
            "logout": "Logout",
            "menu": "Menu",
            "navigation": {
              "about": "About",
              "services": "Services",
              "urgent": "Urgent Printing",
              "faq": "FAQ",
              "contacts": "Contacts"
            }
          },
          "hero": {
            "title": "Premium Digital & Large-Format Printing",
            "subtitle": "in London",
            "description": "Business stationery, flyers, posters, booklets, menus. Expert preflight, same-day options, secure checkout.",
            "calculateOrder": "Calculate Order",
            "uploadArtwork": "Upload Artwork",
            "callNow": "Call Now",
            "quickQuote": "Quick Quote",
            "chooseService": "Choose a service below and quantity, then click Quick quote"
          },
          "cart": {
            "title": "Shopping Cart",
            "empty": "Your cart is empty",
            "item": "Item",
            "quantity": "Qty",
            "price": "Price",
            "total": "Total",
            "subtotal": "Subtotal",
            "vat": "VAT (20%)",
            "grandTotal": "Grand Total",
            "remove": "Remove",
            "goToCalculator": "go to calculator",
            "checkout": "Proceed to Checkout",
            "continueShopping": "Continue Shopping"
          },
          "checkout": {
            "title": "Checkout",
            "completeOrder": "Complete your order",
            "billingInfo": "Billing Information",
            "deliveryInfo": "Delivery Information",
            "paymentMethod": "Payment Method",
            "orderSummary": "Order Summary",
            "firstName": "First Name",
            "lastName": "Last Name",
            "email": "Email",
            "phone": "Phone",
            "address": "Address",
            "city": "City",
            "postcode": "Postcode",
            "country": "Country",
            "cardNumber": "Card Number",
            "expiryDate": "Expiry Date",
            "cvv": "CVV",
            "placeOrder": "Place Order",
            "sameAsBilling": "Same as billing information"
          },
          "services": {
            "title": "Our Services",
            "subtitle": "Professional printing solutions for your business",
            "viewDetails": "View Details",
            "calculatePrice": "Calculate Price",
            "popular": "Popular",
            "categories": {
              "businessStationery": "Business Stationery",
              "marketingMaterials": "Marketing Materials",
              "largeFormat": "Large Format",
              "digitalPrinting": "Digital Printing"
            },
            "names": {
              "business-cards": "Business Cards",
              "flyers": "Flyers",
              "leaflets": "Leaflets",
              "posters": "Posters",
              "booklet-printing": "Booklet Printing",
              "appointment-cards": "Appointment Cards",
              "letterheads": "Letterheads",
              "certificates": "Certificates",
              "compliment-slips": "Compliment Slips",
              "loyalty-cards": "Loyalty Cards",
              "brochures": "Brochures",
              "business-stationery": "Business Stationery",
              "menus": "Menus",
              "booklets": "Booklets",
              "banners": "Banners",
              "signs": "Signs",
              "labels": "Labels",
              "stickers": "Stickers",
              "invitations": "Invitations",
              "presentations": "Presentations",
              "catalogs": "Catalogs",
              "drawing-printing": "Drawing Printing",
              "envelopes": "Envelopes",
              "a3-document-scanning": "A3 Document Scanning",
              "business-card-printing": "Business Card Printing",
              "binding": "Binding",
              "calendar": "Calendars",
              "event-posters": "Event Posters",
              "flat-restaurant-menu": "Flat Restaurant Menu",
              "folded-restaurant-menu": "Folded Restaurant Menu",
              "folding": "Folding",
              "glueing": "Glueing",
              "greetings-cards": "Greetings Cards",
              "hole-punching": "Hole Punching",
              "lamination": "Lamination",
              "lamination-a5-a1": "A5-A1 Laminating",
              "membership-cards": "Membership Cards",
              "ncr-pads": "NCR Pads",
              "order-of-service": "Order of Service",
              "overprint-envelopes": "Overprint Envelopes",
              "perforating": "Perforating",
              "photocopying-bw": "Photocopying B/W",
              "photocopying-colour": "Photocopying Colour",
              "place-cards": "Place Cards",
              "placemat-menu": "Placemat Menu",
              "postcards": "Postcards",
              "poster-printing": "Poster Printing",
              "poster-printing-large": "Large Poster Printing",
              "rounding-corners": "Rounding Corners",
              "stapling": "Stapling",
              "takeaway-menu": "Takeaway Menu",
              "thank-you-cards": "Thank You Cards",
              "waterproof-menu": "Waterproof Menu",
              "wedding-stationery": "Wedding Stationery",
              "wrapping-paper": "Wrapping Paper"
            }
          },
          "why": {
            "title": "Why Choose Pixel Print?",
            "subtitle": "Excellence in every printing project",
            "articles": {
              "same-day-turnaround": {
                "title": "Same-Day Turnaround",
                "description": "Urgent printing service for projects that can't wait"
              },
              "premium-quality": {
                "title": "Premium Quality",
                "description": "Top-grade materials and advanced printing technology"
              },
              "expert-preflight": {
                "title": "Expert Preflight",
                "description": "Professional file review before printing"
              },
              "secure-checkout": {
                "title": "Secure Checkout",
                "description": "Protected and reliable payment process"
              },
              "professional-service": {
                "title": "Professional Service",
                "description": "Expert and personalized customer service"
              },
              "fast-delivery": {
                "title": "Fast Delivery",
                "description": "Quick and reliable delivery across London"
              }
            }
          },
          "contact": {
            "title": "Get in Touch",
            "subtitle": "We're here to help with your next project",
            "name": "Name",
            "email": "Email",
            "phone": "Phone",
            "message": "Message",
            "sendMessage": "Send Message",
            "address": "Address",
            "workingHours": "Working Hours",
            "fillRequiredFields": "Please fill in all required fields",
            "thankYouMessage": "Thank you for your message! We'll get back to you soon.",
            "quickQuoteDescription": "Get an instant quote for your printing needs using our online calculator.",
            "calculateNow": "Calculate Now",
            "messagePlaceholder": "Tell us about your printing needs..."
          },
          "footer": {
            "description": "London's premier typography and printing services. Professional quality, exceptional service, and innovative solutions for all your printing needs.",
            "services": "Services",
            "quickLinks": "Quick Links",
            "contact": "Contact",
            "aboutUs": "About Us",
            "pricing": "Pricing",
            "calculateQuote": "Calculate Quote",
            "uploadArtwork": "Upload Artwork",
            "getQuote": "Get Quote",
            "copyright": "© 2024 Pixel Print London. All rights reserved.",
            "privacyPolicy": "Privacy Policy",
            "termsOfService": "Terms of Service"
          },
          "commandPalette": {
            "title": "Search Services and Calculators",
            "placeholder": "Search services or calculators...",
            "noResults": "No results.",
            "services": "Services"
          },
          "common": {
            "loading": "Loading...",
            "error": "Error",
            "success": "Success",
            "save": "Save",
            "cancel": "Cancel",
            "edit": "Edit",
            "delete": "Delete",
            "close": "Close",
            "back": "Back",
            "next": "Next",
            "previous": "Previous",
            "submit": "Submit",
            "reset": "Reset",
            "search": "Search",
            "filter": "Filter",
            "sort": "Sort",
            "view": "View",
            "download": "Download",
            "upload": "Upload",
            "select": "Select",
            "choose": "Choose",
            "required": "Required",
            "optional": "Optional",
            "showLess": "Show Less",
            "moreServices": "more services",
            "showAllServices": "Show All Services",
            "noArticlesFound": "No articles found",
            "visitPage": "Visit page",
            "learnMore": "Learn more"
          },
          "service": {
            "quantity": "Quantity",
            "turnaround": "Turnaround",
            "delivery": "Delivery",
            "uploadArtwork": "Upload Artwork",
            "uploadedFiles": "Uploaded Files",
            "addToCart": "Add to Cart",
            "getQuote": "Get Quote",
            "calculatePrice": "Calculate Price",
            "standard": "Standard",
            "express": "Express",
            "pickup": "Pickup",
            "courier": "Courier",
            "features": {
              "fastTurnaround": "Fast Turnaround",
              "flexibleDelivery": "Flexible Delivery",
              "secureCheckout": "Secure Checkout",
              "premiumQuality": "Premium Quality",
              "secureProcessing": "Secure Processing"
            },
            "messages": {
              "serviceNotFound": "Service Not Found",
              "serviceNotFoundDesc": "The service you're looking for doesn't exist.",
              "viewAllServices": "View All Services",
              "whyChoose": "Why Choose Our",
              "professionalPrinting": "Professional printing services with attention to detail",
              "calculateOrder": "Calculate Your Order",
              "configureService": "Configure your",
              "getInstantQuote": "and get an instant quote",
              "chooseOption": "Choose",
              "dropFiles": "Drop files here or click to browse",
              "selectOptions": "Select options to see pricing",
              "proceedCheckout": "Proceed to Checkout",
              "addedToCart": "Added to cart!",
              "calculateFirst": "Please calculate price first",
              "failedCalculate": "Failed to calculate price"
            }
          }
        };
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    }
    
    // Support nested keys like 'header.title'
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to key if translation not found
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

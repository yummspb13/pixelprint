"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  serviceName: string;
  serviceSlug: string;
  parameters: Record<string, string>;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  uploadedFile?: File;
  fileName?: string;
  fileSize?: number;
  notes?: string;
}

export interface CheckoutData {
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

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, file: File) => void;
  clearCart: () => void;
  restoreCart: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  checkout: (checkoutData: CheckoutData) => Promise<void>;
  totalAmount: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('pixel-print-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setItems(parsedCart);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixel-print-cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    const totalPrice = item.unitPrice * item.quantity;
    
    setItems(prev => {
      // Check if item with same service and parameters already exists
      const existingItem = prev.find(existing => 
        existing.serviceSlug === item.serviceSlug && 
        JSON.stringify(existing.parameters) === JSON.stringify(item.parameters) &&
        existing.fileName === item.fileName // Учитываем файл при сравнении
      );
      
      if (existingItem) {
        // Update quantity of existing item
        return prev.map(existing => 
          existing.id === existingItem.id
            ? { ...existing, quantity: existing.quantity + item.quantity, totalPrice: existing.unitPrice * (existing.quantity + item.quantity) }
            : existing
        );
      } else {
        // Add new item
        const id = `${item.serviceSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return [...prev, { ...item, id, totalPrice }];
      }
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
        : item
    ));
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, notes } : item
    ));
  }, []);

  const removeFile = useCallback((id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, uploadedFile: undefined, fileName: undefined, fileSize: undefined } : item
    ));
  }, []);

  const updateFile = useCallback((id: string, file: File) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        uploadedFile: file, 
        fileName: file.name, 
        fileSize: file.size 
      } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const restoreCart = useCallback((itemsToRestore: CartItem[]) => {
    setItems(itemsToRestore);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const checkout = useCallback(async (checkoutData: CheckoutData) => {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add items without File objects (they can't be serialized)
      const itemsForAPI = items.map(item => ({
        ...item,
        uploadedFile: undefined // Remove File object for JSON serialization
      }));
      
      formData.append('items', JSON.stringify(itemsForAPI));
      formData.append('checkoutData', JSON.stringify(checkoutData));
      formData.append('totalAmount', totalAmount.toString());
      formData.append('customerInfo', JSON.stringify(checkoutData.contactInfo || checkoutData));

      // Add files separately
      items.forEach((item, index) => {
        if (item.uploadedFile) {
          formData.append(`file_${index}`, item.uploadedFile);
        }
      });

      const response = await fetch('/api/orders/', {
        method: 'POST',
        body: formData, // Remove Content-Type header, let browser set it
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      // Handle different payment methods
      if (result.redirectToPayment) {
        // For online payment, don't clear cart yet - wait for payment success
        // Store order info for potential restoration
        if (typeof window !== 'undefined') {
          localStorage.setItem('pixel-print-pending-order', JSON.stringify({
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            items: items,
            totalAmount: totalAmount
          }));
        }
        // Redirect to payment page
        window.location.href = result.paymentUrl;
      } else {
        // For manager review, clear cart immediately as no payment is needed
        setItems([]);
        setIsOpen(false);
        console.log('Order created:', result.orderNumber);
      }

      return result;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, [items, totalAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        removeFile,
        updateFile,
        clearCart,
        restoreCart,
        openCart,
        closeCart,
        checkout,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

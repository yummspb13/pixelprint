"use client";
import { useCart } from "@/contexts/CartContext";
import CartSidebar from "./CartSidebar";

export default function CartProvider() {
  const cart = useCart();
  
  if (!cart) {
    return null;
  }

  return (
    <CartSidebar
      isOpen={cart.isOpen}
      onClose={cart.closeCart}
      items={cart.items}
      onRemoveItem={cart.removeItem}
      onUpdateQuantity={cart.updateQuantity}
      onUpdateNotes={cart.updateNotes}
      onRemoveFile={cart.removeFile}
      onUpdateFile={cart.updateFile}
    />
  );
}

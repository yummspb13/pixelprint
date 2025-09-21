"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface CartItem {
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

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onRemoveFile: (id: string) => void;
  onUpdateFile: (id: string, file: File) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveFile,
  onUpdateFile
}: CartSidebarProps) {
  const { t } = useLanguage();
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md sm:max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-px-cyan to-px-magenta text-white">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6" />
                <h2 className="text-xl font-bold">{t('cart.title')}</h2>
                {totalItems > 0 && (
                  <Badge className="bg-white text-px-magenta font-bold">
                    {totalItems}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-px-fg mb-2">{t('cart.empty')}</h3>
                  <p className="text-px-muted">{t('common.continueShopping')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-px-fg">{t('cart.item')}</h3>
                  
                  {items.map((item) => (
                    <Card key={item.id} className="border-zinc-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-px-fg">{item.serviceName}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Parameters */}
                        <div className="text-sm text-px-muted mb-3">
                          {Object.entries(item.parameters).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {value}
                            </span>
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
                                  onClick={() => onRemoveFile(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 flex-shrink-0 ml-2"
                                >
                                  <X className="h-3 w-3" />
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
                                      onUpdateFile(item.id, file);
                                      toast.success(`File "${file.name}" uploaded`);
                                    }
                                  }}
                                  className="text-xs"
                                />
                                <div className="text-xs text-zinc-400">
                                  или{' '}
                                  <button 
                                    onClick={() => {
                                      onClose();
                                      window.location.href = `/services/${item.serviceSlug}/`;
                                    }}
                                    className="text-px-cyan hover:text-px-magenta transition-colors"
                                  >
                                    перейти к калькулятору
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2 mb-3">
                          <Label className="text-sm font-medium text-px-fg">Количество:</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>

                        {/* Price */}
                        <div className="text-right mb-3">
                          <div className="text-lg font-bold text-px-fg">
                            £{item.totalPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-px-muted">
                            £{item.unitPrice.toFixed(2)} × {item.quantity}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label className="text-xs text-px-muted">
                            Примечания к заказу:
                          </Label>
                          <Textarea
                            value={item.notes || ''}
                            onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                            placeholder="Особые требования, цветовые предпочтения и т.д."
                            className="text-xs min-h-[60px] resize-none"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t bg-zinc-50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-px-muted">
                    Итого: {totalItems} {totalItems === 1 ? 'услуга' : 'услуг'}
                  </div>
                  <div className="text-2xl font-bold text-px-fg">
                    £{totalAmount.toFixed(2)}
                  </div>
                </div>
                
                {/* Go to Checkout Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose();
                    window.location.href = '/checkout/';
                  }}
                  className="w-full border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('cart.checkout')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
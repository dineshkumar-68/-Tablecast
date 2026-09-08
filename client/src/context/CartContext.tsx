import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, MenuItemAddon } from '../types';

export interface CartItem {
  id: string; // unique key for this combination (itemId + addons)
  item: MenuItem;
  quantity: number;
  selectedAddons: MenuItemAddon[];
  itemUnitPrice: number; // base price + addons
  lineTotal: number;
}

export interface PlacedOrderSummary {
  id: string;
  orderNumber: string;
  tableNumber: string;
  trackingToken: string;
  status: string;
  totalAmount: number;
  prepTimeMinutes: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, addons: MenuItemAddon[]) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotalAmount: number;
  taxAmount: number;
  totalPayableAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  customerNotes: string;
  setCustomerNotes: (notes: string) => void;
  activeOrder: PlacedOrderSummary | null;
  setActiveOrder: (order: PlacedOrderSummary | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<PlacedOrderSummary | null>(() => {
    try {
      const saved = localStorage.getItem('tablecast_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persist active order in local storage
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('tablecast_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('tablecast_active_order');
    }
  }, [activeOrder]);

  const addToCart = (item: MenuItem, quantity: number, addons: MenuItemAddon[]) => {
    // Generate unique composite key based on item ID and sorted addon IDs
    const addonIdsKey = addons.map((a) => a.id).sort().join('-');
    const cartItemId = `${item.id}_${addonIdsKey}`;

    const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + addonsTotal;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                lineTotal: (i.quantity + quantity) * unitPrice,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          item,
          quantity,
          selectedAddons: addons,
          itemUnitPrice: unitPrice,
          lineTotal: quantity * unitPrice,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === cartItemId
          ? {
              ...i,
              quantity: qty,
              lineTotal: qty * i.itemUnitPrice,
            }
          : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerNotes('');
  };

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalAmount = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const taxAmount = Math.round(subtotalAmount * 0.05); // 5% GST
  const totalPayableAmount = subtotalAmount + taxAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        subtotalAmount,
        taxAmount,
        totalPayableAmount,
        isCartOpen,
        setIsCartOpen,
        customerNotes,
        setCustomerNotes,
        activeOrder,
        setActiveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  id: string;
  name: string;
  meta: string;
  price: number;
}

interface CommerceContextValue {
  balance: number;
  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  addManyToCart: (items: CartItem[]) => void;
  clearCart: () => void;
  addFunds: (amount: number) => void;
}

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

const readStoredNumber = (key: string) => {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : 0;
};

export const CommerceProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(() => readStoredNumber("nexus-balance"));
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem("nexus-balance", String(balance)), [balance]);
  useEffect(() => localStorage.setItem("nexus-cart", JSON.stringify(cartItems)), [cartItems]);

  const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + item.price, 0), [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((current) => (current.some((cartItem) => cartItem.id === item.id) ? current : [...current, item]));
  };

  const addManyToCart = (items: CartItem[]) => {
    setCartItems((current) => {
      const next = new Map(current.map((item) => [item.id, item]));
      items.forEach((item) => next.set(item.id, item));
      return Array.from(next.values());
    });
  };

  const clearCart = () => setCartItems([]);
  const addFunds = (amount: number) => setBalance((current) => current + amount);

  return (
    <CommerceContext.Provider value={{ balance, cartItems, cartTotal, addToCart, addManyToCart, clearCart, addFunds }}>
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used within CommerceProvider");
  return context;
};
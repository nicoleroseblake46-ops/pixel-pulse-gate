import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

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
  refreshBalance: () => Promise<void>;
  createPendingPayment: (amount: number, bonus: number, coin: string, walletAddress: string) => Promise<string>;
  purchaseCartWithBalance: () => Promise<string>;
}

const CommerceContext = createContext<CommerceContextValue | undefined>(undefined);

export const CommerceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("nexus-cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => localStorage.setItem("nexus-cart", JSON.stringify(cartItems)), [cartItems]);

  const refreshBalance = async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    const { data, error } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
    if (error) throw error;
    setBalance(Number(data?.balance ?? 0));
  };

  useEffect(() => {
    refreshBalance().catch(() => setBalance(0));
  }, [user?.id]);

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

  const createPendingPayment = async (amount: number, bonus: number, coin: string, walletAddress: string) => {
    if (!user) throw new Error("You must be signed in to checkout.");

    const { data, error } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount,
        bonus_amount: bonus,
        cart_total: cartTotal,
        coin,
        wallet_address: walletAddress,
        status: "pending",
        metadata: { cart_items: cartItems.map((item) => ({ ...item })) } as Json,
      })
      .select("id")
      .single();

    if (error) throw error;
    clearCart();
    await refreshBalance();
    return data.id;
  };

  const purchaseCartWithBalance = async () => {
    if (!user) throw new Error("You must be signed in to purchase.");
    if (!cartItems.length) throw new Error("Your cart is empty.");

    const { data, error } = await (supabase as any).rpc("purchase_cart", {
      _items: cartItems.map((item) => ({ ...item })),
      _cart_total: cartTotal,
    });

    if (error) throw error;
    clearCart();
    await refreshBalance();
    return data as string;
  };

  return (
    <CommerceContext.Provider value={{ balance, cartItems, cartTotal, addToCart, addManyToCart, clearCart, refreshBalance, createPendingPayment, purchaseCartWithBalance }}>
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used within CommerceProvider");
  return context;
};
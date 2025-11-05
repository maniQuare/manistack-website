"use client"

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";

// Amazon-style Cart / Bag component (single-file React + Tailwind)
// - Tailwind CSS classes used (assumes Tailwind is available in the project)
// - Replace sample data with your backend/store connection as needed

type CartItem = {
  id: string;
  title: string;
  price: number; // in rupees (or smallest unit you'd like)
  qty: number;
  image: string;
  rating?: number;
};

export default function AmazonCart() {
  // sample initial cart data — replace with props or Redux/Mobx store integration
  const [items, setItems] = useState<CartItem[]>([
    {
      id: "p1",
      title: "Wireless Bluetooth Headphones — Long Battery Life",
      price: 2499.0,
      qty: 1,
      image: "/images/headphones.jpg",
      rating: 4.4,
    },
    {
      id: "p2",
      title: "Stainless Steel Insulated Water Bottle 1L",
      price: 799.0,
      qty: 2,
      image: "/images/bottle.jpg",
      rating: 4.7,
    },
    {
      id: "p3",
      title: "Slim Laptop Sleeve 13-14 inch",
      price: 599.0,
      qty: 1,
      image: "/images/laptop-sleeve.jpg",
      rating: 4.2,
    },
  ]);

  const updateQty = (id: string, newQty: number) => {
    setItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, qty: Math.max(1, newQty) } : it))
        .filter(Boolean)
    );
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + it.price * it.qty, 0),
    [items]
  );

  const deliveryCharge = useMemo(() => (subtotal > 1999 ? 0 : 49), [subtotal]);
  const discount = useMemo(() => (subtotal > 5000 ? subtotal * 0.05 : 0), [subtotal]);
  const total = useMemo(() => subtotal + deliveryCharge - discount, [subtotal, deliveryCharge, discount]);

  const fmt = (n: number) => {
    // Format currency — change locale/currency as required
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cart list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Your cart is empty.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center border-b last:border-b-0 py-4">
                  <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {/* If you're using Next.js Image, ensure the image path is public or from remote domain */}
                    <Image src={item.image} alt={item.title} width={112} height={112} className="object-cover" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <div className="text-sm text-gray-500 mt-1">Rating: {item.rating ?? "-"} ⭐</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{fmt(item.price)}</div>
                        <div className="text-sm text-gray-500">each</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="px-4 py-2 w-12 text-center">{item.qty}</div>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-2 hover:bg-gray-100">
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">Subtotal: <span className="font-semibold">{fmt(item.price * item.qty)}</span></div>
                        <button onClick={() => removeItem(item.id)} className="rounded-md p-2 hover:bg-gray-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Suggestions / Continue shopping */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">Want faster delivery?</h4>
              <p className="text-sm text-gray-500">Add items worth {fmt(2000 - subtotal > 0 ? 2000 - subtotal : 0)} more to get free delivery.</p>
            </div>
            <button className="bg-yellow-500 px-4 py-2 rounded-md font-medium">Continue shopping</button>
          </div>
        </div>

        {/* Right: Summary */}
        <aside className="bg-white rounded-2xl shadow-sm p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Order summary</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Items ({items.reduce((a, b) => a + b.qty, 0)})</span>
              <span className="font-medium">{fmt(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Delivery</span>
              <span className="font-medium">{deliveryCharge === 0 ? "Free" : fmt(deliveryCharge)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Discount</span>
              <span className="font-medium">-{fmt(discount)}</span>
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-base font-semibold">Total</span>
              <span className="text-2xl font-bold">{fmt(total)}</span>
            </div>

            <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">Proceed to Checkout</button>

            <button className="w-full mt-2 border border-gray-200 py-3 rounded-lg font-medium">Pay on Delivery</button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Prices, offers and availability are subject to change. Local taxes may apply at checkout.
          </div>
        </aside>
      </div>
    </div>
  );
}

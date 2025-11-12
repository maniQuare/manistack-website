"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchProducts } from "@/store/productSlice";
import { bagActions } from "@/store/bagSlice";
import { Product } from "@/types/Product";
import HadTails from "@/components/HadTails";
import TeenPatti from "@/components/TeenPatti"

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();

  // products slice (unchanged)
  const { items: products, loading } = useSelector(
    (state: RootState) => state.products
  );

  // bag could be either: string[] OR { items: Product[] } OR Product[]
  // we'll normalize it to an array of product objects for our checks
  const rawBag = useSelector((state: RootState) => state.bag as any);

  // Normalize to array of Product objects
  const bagItems: Product[] =
    Array.isArray(rawBag) && rawBag.length && typeof rawBag[0] === "string"
      ? // case: array of ids -> convert to empty objects (we'll only compare ids)
        rawBag.map((id: string) => ({ _id: id } as Product))
      : Array.isArray(rawBag)
      ? (rawBag as Product[]) // case: array of Product objects
      : rawBag?.items && Array.isArray(rawBag.items)
      ? (rawBag.items as Product[]) // case: { items: Product[] }
      : [];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const toggleBag = (product: Product) => {
    const exists = bagItems.some((b) => b._id === product._id);
    if (exists) dispatch(bagActions.removeFromBag(product._id));
    else dispatch(bagActions.addToBag(product));
  };

  if (loading) return <p className="p-5 text-lg font-semibold">Loading...</p>;

  return (
    <div>
      
      <TeenPatti/>
    </div>
  );
}

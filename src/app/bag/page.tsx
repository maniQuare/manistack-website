"use client";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { bagActions } from "@/store/bagSlice";
import Image from "next/image";
import Link from "next/link";

export default function BagPage() {
  const dispatch = useDispatch();
  const bag = useSelector((state: RootState) => state.bag.items);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Shopping Bag</h1>

      {bag.length === 0 && (
        <div className="text-center text-gray-600">
          <p>Your bag is empty</p>
          <Link
            href="/"
            className="mt-3 inline-block bg-yellow-500 px-4 py-2 rounded text-black font-semibold"
          >
            Shop Now
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {bag.map((item) => (
          <div key={item._id} className="flex items-center gap-3 border p-2 rounded-lg">
            <div className="w-20 h-20 relative">
              <Image src={item.thumbnail} alt={item.title} fill className="object-cover rounded-md" sizes="100px"/>
            </div>

            <div className="flex-1">
              <h2 className="font-semibold text-sm line-clamp-2">{item.title}</h2>
              <p className="text-sm font-bold">₹{item.price}</p>
            </div>

            <button
              onClick={() => dispatch(bagActions.removeFromBag(item._id))}
              className="text-red-600 text-xs font-bold border border-red-600 px-2 py-1 rounded"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  title: string;
  price: number;
  description?: string;
  thumbnail?: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  console.log(products)
  
  

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);
return (
  <div>
    {products.map((p) => (
      <div key={p._id}>
        <img 
          src={p.thumbnail} 
          alt={p.title} 
          style={{ width: "150px", height: "150px", objectFit: "cover" }} 
        />
        <h3>{p.title}</h3>
        <p>₹{p.price}</p>
      </div>
    ))}
  </div>
);

}

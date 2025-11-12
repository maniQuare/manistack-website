export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  images?: string[];
  brand?: string;
  category?: string;
  stock?: number;
  rating?: number;
  discountPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

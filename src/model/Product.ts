import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: String,
    price: Number,
    thumbnail: String,
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;

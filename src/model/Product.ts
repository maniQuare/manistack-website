import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
});

// ✅ Prevents OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;

import Product from "@/model/Product";
import dbConnect from "../../lib/dbConnect";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const products = await Product.find();
  return NextResponse.json(products);
}

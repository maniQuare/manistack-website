import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/Product";

interface BagState {
  items: Product[];
}

const initialState: BagState = {
  items: [],
};

const bagSlice = createSlice({
  name: "bag",
  initialState,
  reducers: {
    addToBag: (state, action: PayloadAction<Product>) => {
      const exists = state.items.some((i) => i._id === action.payload._id);
      if (!exists) state.items.push(action.payload);
    },

    removeFromBag: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
  },
});

export const bagActions = bagSlice.actions;
export default bagSlice.reducer;

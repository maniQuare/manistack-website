import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./productSlice";
import bagReducer from "./bagSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    bag: bagReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

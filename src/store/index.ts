import { configureStore } from "@reduxjs/toolkit";
import viewerReducer from "./viewerSlice";

export const store = configureStore({
  reducer: {
    viewer: viewerReducer,
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

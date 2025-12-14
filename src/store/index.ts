import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // Add more reducers here as your app grows
  },
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

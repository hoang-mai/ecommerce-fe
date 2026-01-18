import { configureStore } from "@reduxjs/toolkit";
import { alertSlice } from "@/redux/slice/alertSlice";
import { chatSlice } from "./slice/chatSlice";
import { checkoutSlice } from "@/redux/slice/checkoutSlice";

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
    chat: chatSlice.reducer,
    checkout: checkoutSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
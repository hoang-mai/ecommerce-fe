import {configureStore} from "@reduxjs/toolkit";
import {alertSlice} from "@/redux/slice/alertSlice";
import {chatSlice} from "./slice/chatSlice";

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
    chat: chatSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
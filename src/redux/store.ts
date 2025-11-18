import {configureStore} from "@reduxjs/toolkit";
import {alertSlice} from "@/redux/slice/alertSlice";

export const store = configureStore({
  reducer: {
    alert: alertSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
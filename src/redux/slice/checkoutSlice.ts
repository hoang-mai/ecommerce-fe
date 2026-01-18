import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
    isCreatingOrder: boolean;
}

const initialState: CheckoutState = {
    isCreatingOrder: false,
};

export const checkoutSlice = createSlice({
    name: "checkout",
    initialState,
    reducers: {
        setIsCreatingOrder: (state, action: PayloadAction<boolean>) => {
            state.isCreatingOrder = action.payload;
        },
    },
});

export const { setIsCreatingOrder } = checkoutSlice.actions;
export default checkoutSlice.reducer;

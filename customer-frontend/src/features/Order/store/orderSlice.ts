import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OrderNumber } from "../../../model/orderNumber/orderNumber";
import { RootState } from "../../../shared/store/store";

export interface OrderState {
  orderNumber: OrderNumber | undefined;
  isExisitingOrder: boolean;
}

const initialState: OrderState = {
  orderNumber: undefined,
  isExisitingOrder: false,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setOrder: (state, action: PayloadAction<OrderState>) => action.payload,
    clearOrder: (state) => initialState,
  },
});

export const orderActions = orderSlice.actions;

export const selectOrderSate = (state: RootState) => state.order;

export const selectOrderNumber = createSelector(
  selectOrderSate,
  (state) => state.orderNumber
);

export default orderSlice.reducer;

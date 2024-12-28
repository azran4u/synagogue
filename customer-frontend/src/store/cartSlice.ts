import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { isNil, set } from "lodash";
import { RootState } from "./store";
import { v4 as uuidv4 } from "uuid";
import { CheckoutFormValues } from "../pages/CheckoutPage";

export type CartItem = {
  id: string;
  amount: number;
};

export type CartItemsMap = Map<string, { id: string; amount: number }>;
export type UpdateCartItemAmountOperations = "increase-one" | "decrease-one";

export interface CartState {
  items: CartItem[];
  orderId: string;
  checkout: CheckoutFormValues;
}

const initialState: CartState = {
  items: [],
  orderId: uuidv4(),
  checkout: {
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    prefferedPickupLocation: "",
    comments: "",
  },
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    upsertItems: (state, action: PayloadAction<CartItem[]>) => {
      action.payload.forEach((cartItem) => {
        if (isNil(cartItem.id || cartItem.amount)) {
          console.error(
            `CART_UPSERT_ITEMS: invalid id ${cartItem.id} or amount ${cartItem.amount}`
          );
          return state;
        }
        const foundItem = state.items.find((x) => x.id === cartItem.id);
        if (foundItem) {
          set(foundItem, "amount", foundItem.amount + cartItem.amount);
        } else {
          state.items.push(cartItem);
        }
        return state;
      });
    },
    clear: (state) => {
      state.items = [];
    },
    increaseAmount: (
      state,
      action: PayloadAction<{
        id: string;
      }>
    ) => {
      const { id } = action.payload;

      if (isNil(id)) {
        console.error(`CART_INCREASE_ITEM_AMOUNT: invalid id ${id}`);
        return state;
      }
      const foundItem = state.items.find((x) => x.id === id);

      if (isNil(foundItem)) {
        return state;
      }

      foundItem.amount += 1;

      return state;
    },

    decreaseAmount: (
      state,
      action: PayloadAction<{
        id: string;
      }>
    ) => {
      const { id } = action.payload;

      if (isNil(id)) {
        console.error(`CART_DECREASE_ITEM_AMOUNT: invalid id ${id}`);
        return state;
      }
      const foundItem = state.items.find((x) => x.id === id);

      if (isNil(foundItem)) {
        return state;
      }

      foundItem.amount -= 1;

      return state;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      if (isNil(id)) {
        console.error(`CART_REMOVE_ITEM: invalid id ${id}}`);
        return state;
      }

      const foundItem = state.items.find((x) => x.id === id);

      if (isNil(foundItem)) {
        return state;
      }

      state.items = state.items.filter((x) => x.id !== id);

      return state;
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    setCheckout: (state, action: PayloadAction<CheckoutFormValues>) => {
      state.checkout = action.payload;
    },
    restoreInitialState: (state) => {
      state.items = initialState.items;
      state.orderId = uuidv4();
      state.checkout = initialState.checkout;
    },
  },
});

export const cartActions = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart;

export const selectCartItemsArray = createSelector(
  selectCart,
  (cart) => cart.items
);

export const selectCartItemsCount = createSelector(
  selectCartItemsArray,
  (items) => items.reduce((prev, curr) => prev + curr.amount, 0)
);

export const selectOrderId = createSelector(selectCart, (cart) => cart.orderId);

export const selectCheckout = createSelector(
  selectCart,
  (cart) => cart.checkout
);

export const cartSelectors = {
  selectCart,
  selectCartItemsArray,
  selectCartItemsCount,
  selectOrderId,
  selectCheckout,
};

export default cartSlice.reducer;

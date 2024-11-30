import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { RootState } from "./store";

export type CartItem = {
  id: string;
  amount: number;
};

export type CartItemsMap = Map<string, { id: string; amount: number }>;
export type UpdateCartItemAmountOperations = "increase-one" | "decrease-one";

export interface CartState {
  items: CartItemsMap;
}

const initialState: CartState = {
  items: new Map<string, CartItem>(),
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

        if (state.items.has(cartItem.id)) {
          state.items.set(cartItem.id, {
            id: cartItem.id,
            amount: state.items.get(cartItem.id)!.amount + cartItem.amount,
          });
        } else {
          state.items.set(cartItem.id, cartItem);
        }
        return state;
      });
    },
    clear: (state) => {
      state.items.clear();
      return state;
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
      const foundItem = state.items.get(id);

      if (isNil(foundItem)) {
        return state;
      }

      state.items.set(id, {
        id,
        amount: foundItem.amount + 1,
      });

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
      const foundItem = state.items.get(id);

      if (isNil(foundItem)) {
        return state;
      }

      state.items.set(id, {
        id,
        amount: foundItem.amount - 1,
      });

      return state;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      if (isNil(id)) {
        console.error(`CART_REMOVE_ITEM: invalid id ${id}}`);
        return state;
      }

      const foundItem = state.items.get(id);

      if (isNil(foundItem)) {
        return state;
      }

      state.items.delete(id);

      return state;
    },
  },
});

export const cartActions = cartSlice.actions;

export const selectCart = (state: RootState) => state.cart;

export const selectCartItemsMap = createSelector(
  selectCart,
  (cart) => cart.items
);

export const selectCartItemsArray = createSelector(selectCartItemsMap, (map) =>
  Array.from(map.values())
);

export const selectCartItemsCount = createSelector(
  selectCartItemsArray,
  (items) => items.reduce((prev, curr) => prev + curr.amount, 0)
);

export const cartSelectors = {
  selectCart,
  selectCartItemsArray,
  selectCartItemsMap,
  selectCartItemsCount,
};

export default cartSlice.reducer;

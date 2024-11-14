import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../shared/store/store";
import { isNil } from "lodash";
import { CheckoutDetails } from "../../../model/checkout/checkout";

export interface CheckoutState extends CheckoutDetails {}

const initialState: CheckoutState = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  prefferedPickupLocation: "",
  comments: "",
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState: getLocalStorage(),
  reducers: {
    upsert: (state, action: PayloadAction<Partial<CheckoutState>>) => {
      const newState = {
        ...state,
        ...action.payload,
      };
      setLocalStorage(newState);
      return newState;
    },

    clear: (state) => {
      setLocalStorage(initialState);
      return initialState;
    },
  },
});

export const checkoutActions = checkoutSlice.actions;

export const selectCheckout = (state: RootState) => state.checkout;

export default checkoutSlice.reducer;

function serializer(state: CheckoutState): string {
  return JSON.stringify(state);
}

function deSerializer(serializedString: string): CheckoutState {
  return JSON.parse(serializedString);
}

function getLocalStorage(): CheckoutState {
  let checkout = localStorage.getItem("checkout");
  if (!isNil(checkout)) {
    return deSerializer(checkout);
  } else {
    return initialState;
  }
}

function setLocalStorage(state: CheckoutState) {
  localStorage.setItem("checkout", serializer(state));
}

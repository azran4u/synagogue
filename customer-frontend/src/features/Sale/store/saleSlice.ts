import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../shared/store/store";
import { Sale } from "../../../model/sale/sale";

export interface SaleState {
  currentSale: Sale;
  isLoading: boolean;
}

const initialState: SaleState = {
  currentSale: { name: "", active: false },
  isLoading: true,
};

export const saleSlice = createSlice({
  name: "sale",
  initialState,
  reducers: {
    fetchActiveSale: (state) => state,
    upsertActiveSale: (state, action: PayloadAction<Sale>) => {
      return {
        currentSale: action.payload,
        isLoading: false,
      };
    },

    clearActiveSale: (state) => {
      state.currentSale = initialState.currentSale;
    },
  },
});

export const saleActions = saleSlice.actions;

export const selectSale = (state: RootState) => state.sale;

export const selectSaleActive = createSelector(
  selectSale,
  (state) => state.currentSale
);

export default saleSlice.reducer;

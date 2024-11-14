import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../shared/store/store";
import { pickups } from "../../../utils/pickup-generator/pickupGenerator";
import { isNil } from "lodash";
import { PickupLocation } from "../../../model/pickup/pickupLocation";

export interface PickupState {
  locations: Map<string, PickupLocation>;
}

const initialState: PickupState = {
  locations: pickups.reduce((prev, curr) => {
    prev.set(curr.dispalyName, curr);
    return prev;
  }, new Map<string, PickupLocation>()),
};

export const pickupSlice = createSlice({
  name: "pickup",
  initialState,
  reducers: {
    upsert: (state, action: PayloadAction<PickupLocation[]>) => {
      action.payload.forEach((location) =>
        state.locations.set(location.dispalyName, location)
      );
    },

    clear: (state) => {
      state.locations.clear();
    },
  },
});

export const pickupActions = pickupSlice.actions;

export const selectPickup = (state: RootState) => state.pickup;

export const selectPickupLocationsMap = createSelector(
  selectPickup,
  (state) => state.locations
);

export const selectPickupLocations = createSelector(
  selectPickupLocationsMap,
  (locationsMap) => Array.from(locationsMap.values())
);

export const selectPickupLocationByDispalyName = (displayName: string) =>
  createSelector(selectPickupLocations, (locations) => {
    const location = locations.find((x) => x.dispalyName === displayName);
    if (isNil(location)) {
      console.error(`couldn't find location with displayName ${displayName}`);
    }
    return location;
  });

export default pickupSlice.reducer;

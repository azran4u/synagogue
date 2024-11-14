import { createListenerMiddleware } from "@reduxjs/toolkit";
import { isNil } from "lodash";
import { saleService } from "./services/saleSrevice";
import { saleActions } from "./store/saleSlice";

const saleListenerMiddleware = createListenerMiddleware();

saleListenerMiddleware.startListening({
  actionCreator: saleActions.fetchActiveSale,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners();
    await saleService.getActiveSaleLiveQuery((sale) => {
      if (isNil(sale)) return;
      listenerApi.dispatch(saleActions.upsertActiveSale(sale));
    });
  },
});

export default saleListenerMiddleware;

import { useActiveProducts } from "./useProducts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { cartActions, selectCartItemsArray } from "../store/cartSlice";
import { useEffect } from "react";
import { isEmpty, isNil } from "lodash";

export function useRemoveNonExistingCartItems() {
  const { products } = useActiveProducts();
  const cartContent = useAppSelector(selectCartItemsArray);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      isNil(products) ||
      isEmpty(products) ||
      isNil(cartContent) ||
      isEmpty(cartContent)
    )
      return;

    for (const cartItem of cartContent) {
      const cartItemId = cartItem.id;
      const product = products.find((product) => product.id === cartItemId);
      if (!product) {
        console.error(
          `Product with id ${cartItemId} is in cart but not found in products`
        );
        dispatch(cartActions.removeItem(cartItemId));
      }
    }
  }, [products, cartContent]);
}

import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectCartItemsArray } from "../store/cartSlice";
import { useProducts } from "./useProducts";
import { isEmpty } from "lodash";

export function useCartProducts() {
  const cartContent = useAppSelector(selectCartItemsArray);
  const { products, isLoading } = useProducts();

  const cartProducts = useMemo(() => {
    if (isEmpty(products)) return [];
    return cartContent
      .map((cartItem) => {
        const product = products.find((product) => product.id === cartItem.id);
        if (!product) {
          console.error(
            `Product with id ${cartItem.id} is in cart but not found in products`
          );
          return null;
        }
        return {
          product,
          amount: cartItem.amount,
        };
      })
      .filter((x) => x !== null);
  }, [cartContent, products]);

  return { cartProducts, isLoading };
}

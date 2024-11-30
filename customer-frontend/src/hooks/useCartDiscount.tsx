import { useMemo } from "react";
import { useCartProducts } from "./useCartProducts";
import { groupBy } from "lodash";

export function useCartDiscount() {
  const cartProducts = useCartProducts();

  return useMemo(() => {
    const groups = groupBy(
      cartProducts,
      (product) =>
        `${product.product.price}_${product.product.discount_min_qty}_${product.product.discount_price}`
    );
    let totalCostAfterDiscount = 0;
    let totalCost = cartProducts.reduce(
      (prev, curr) => prev + curr.product.price * curr.amount,
      0
    );
    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      const discountPrice = Number(group[0].product.discount_price);
      const discountMinQty = Number(group[0].product.discount_min_qty);
      const totalItems = group.reduce((prev, curr) => prev + curr.amount, 0);
      const groupTotalCost = group.reduce(
        (prev, curr) => prev + curr.product.price * curr.amount,
        0
      );
      if (totalItems < discountMinQty || discountMinQty === 0) {
        totalCostAfterDiscount += groupTotalCost;
      } else {
        totalCostAfterDiscount += (totalItems / discountMinQty) * discountPrice;
      }
    });
    totalCost = Math.ceil(totalCost);
    totalCostAfterDiscount = Math.ceil(totalCostAfterDiscount);
    return {
      totalCost,
      totalCostAfterDiscount,
      discount: totalCost - totalCostAfterDiscount,
    };
  }, [cartProducts]);
}

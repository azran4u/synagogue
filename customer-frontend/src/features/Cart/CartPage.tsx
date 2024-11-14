import React from "react";
import { useSelector } from "react-redux";
import {
  selectCartItemsTotalAmount,
  selectCartProductsWithAmount,
  selectCartTotalCost,
  selectCartTotalCostAfterDiscount,
} from "./store/cartSlice";
import EmptyCart from "./components/EmptyCart";
import styled from "styled-components";
import CartContent from "./components/CartContent";
import { useAppDispatch, useAppSelector } from "../../shared/store/hooks";
import { cartActions } from "./store/cartSlice";
import { useHistory } from "react-router";

const CartPage: React.FC = () => {
  const itemsCount = useSelector(selectCartItemsTotalAmount);
  const isCartEmpty = itemsCount === 0;
  const history = useHistory();
  const dispatch = useAppDispatch();

  const cartProductsWithAmount = useAppSelector(selectCartProductsWithAmount);

  const totalCost = useAppSelector(selectCartTotalCost);
  const totalCostAfterDiscount = useAppSelector(
    selectCartTotalCostAfterDiscount
  );

  return (
    <Wrapper>
      <h1 className="title">עגלה</h1>
      {isCartEmpty && <EmptyCart className="content" />}
      {!isCartEmpty && (
        <CartContent
          cartProductsWithAmount={cartProductsWithAmount}
          totalCost={totalCost}
          totalCostAfterDiscount={totalCostAfterDiscount}
          clearCart={() => dispatch(cartActions.clear())}
          increaseAmount={(sku: string) =>
            dispatch(cartActions.increaseAmount({ sku }))
          }
          decreaseAmount={(sku: string) =>
            dispatch(cartActions.decreaseAmount({ sku }))
          }
          removeItem={(sku: string) => dispatch(cartActions.removeItem(sku))}
          submitButtonClicked={() => history.push("/checkout")}
          className="content"
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 10vh;
    text-align: center;
  }

  .content {
    min-height: 70vh;
  }
`;

export default CartPage;

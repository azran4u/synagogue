import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectCartItemsCount } from "../Cart/store/cartSlice";
import CartPage from "../Cart/CartPage";
import { CheckoutForm } from "./CheckoutForm";

const CheckoutPage: React.FC = () => {
  const cartItemsCount = useSelector(selectCartItemsCount);
  const isCartEmpty = cartItemsCount < 1;

  if (isCartEmpty) {
    return <CartPage />;
  } else {
    return (
      <Wrapper>
        <h1 className="title">סיום הזמנה</h1>
        <CheckoutForm className="content" />
      </Wrapper>
    );
  }
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

export default CheckoutPage;

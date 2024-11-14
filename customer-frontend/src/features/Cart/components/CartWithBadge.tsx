import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { OptionalClassName } from "../../../utils/classNameInterface";
import { useAppDispatch } from "../../../shared/store/hooks";
import { selectCartItemsTotalAmount } from "../store/cartSlice";
import { sidebarActions } from "../../Layout/Sidebar/store/sidebarSlice";

const CartWithBadge: React.FC<OptionalClassName> = (props) => {
  const dispatch = useAppDispatch();
  const itemsCount = useSelector(selectCartItemsTotalAmount);
  const history = useHistory();

  return (
    <Wrapper
      className={props?.className}
      onClick={() => {
        dispatch(sidebarActions.closeSidebar());
        history.push("/cart");
      }}
    >
      <FaShoppingCart />
      <span className="cart-value">{itemsCount}</span>
    </Wrapper>
  );
};

const Wrapper = styled.span`
  position: relative;
  font-size: 1.5rem;
  cursor: pointer;

  .cart-value {
    position: absolute;
    top: -10px;
    right: -16px;
    background: var(--clr-primary);
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75rem;
    color: var(--clr-text-over-primary);
    padding: 12px;
  }
`;

export default CartWithBadge;

import React from "react";
import { CartItem } from "../../../model/cart/CartItem";
import Button from "../../../shared/components/Button";
import { useAppDispatch } from "../../../shared/store/hooks";
import { OptionalClassName } from "../../../utils/classNameInterface";
import { cartActions } from "../store/cartSlice";

interface AddToCartProps extends OptionalClassName {
  item: CartItem;
}
const AddToCart: React.FC<AddToCartProps> = (props) => {
  const dispatch = useAppDispatch();
  return (
    <Button
      className={props.className}
      text="הוסף לעגלה"
      onClick={() => {
        dispatch(cartActions.upsertItems([props.item]));
      }}
    />
  );
};

export default AddToCart;

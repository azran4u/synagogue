import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Box } from "@mui/material";
import { useOrderById } from "../hooks/useOrderById";
import { useAppDispatch } from "../store/hooks";
import { cartActions } from "../store/cartSlice";

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { order } = useOrderById(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!order?.products) return;
    dispatch(cartActions.clear());
    dispatch(
      cartActions.upsertItems(
        order.products.map(({ product, amount }) => {
          return { id: product.id, amount };
        })
      )
    );
    dispatch(cartActions.setOrderId(order.id));
    dispatch(
      cartActions.setCheckout({
        firstName: order.firstName,
        lastName: order.lastName,
        email: order.email,
        phoneNumber: order.phoneNumber,
        prefferedPickupLocation: order.prefferedPickupLocation,
        comments: order.comments,
      })
    );
    navigate("/cart");
  }, [order]);

  return <Box></Box>;
};
export default OrderPage;

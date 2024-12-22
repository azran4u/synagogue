import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useOrderById } from "../hooks/useOrderById";
import { useAppDispatch } from "../store/hooks";
import { cartActions } from "../store/cartSlice";

const OrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { order, isLoading } = useOrderById(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!order || !order?.products) {
      return;
    }
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

  const isValidOrder = useMemo(() => {
    return !!order && !!order?.date && order?.products.length > 0;
  }, [order]);

  return isValidOrder ? (
    <Box></Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        height: "100%",
        marginTop: "2rem",
      }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Typography color="error" variant="h5">
          הזמנה לא נמצאה
        </Typography>
      )}
    </Box>
  );
};
export default OrderPage;

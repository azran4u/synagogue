import { useQuery } from "@tanstack/react-query";
import { isNil } from "lodash";
import React from "react";
import { useHistory, useParams } from "react-router";
import styled from "styled-components";
import Button from "../../shared/components/Button";
import Loading from "../../shared/components/Loading";
import { useAppDispatch } from "../../shared/store/hooks";
import { DateUtil } from "../../utils/DateUtil";
import { device } from "../../utils/device.sizes";
import CartContent from "../Cart/components/CartContent";
import { cartActions } from "../Cart/store/cartSlice";
import { checkoutActions } from "../Checkout/store/checkoutSlice";
import { ordersService } from "./services/ordersSrevice";
import { orderActions } from "./store/orderSlice";

const OrderPage: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => ordersService.getOrderByOrderNumber(orderNumber),
  });

  function editOrder() {
    if (isNil(data)) return;

    if (!isNil(data.products)) {
      const cartItems = data.products.map((x) => ({
        sku: x.sku,
        amount: x.amount,
      }));
      dispatch(cartActions.clear());
      dispatch(cartActions.upsertItems(cartItems));
    }

    if (!isNil(data.checkoutDetails)) {
      dispatch(checkoutActions.clear());
      dispatch(checkoutActions.upsert(data.checkoutDetails));
    }

    dispatch(orderActions.setOrder({ orderNumber, isExisitingOrder: true }));

    history.push("/cart");
  }

  return (
    <main>
      <Wrapper className="page">
        <div className="title">
          <h1>הזמנה</h1>
        </div>
        <div className="content">
          {isLoading && <Loading />}
          {isError && <h5>לא ניתן לטעון את ההזמנה</h5>}
          {!isLoading && data && (
            <>
              <h5>
                שם:{" "}
                {data.checkoutDetails.firstName +
                  " " +
                  data.checkoutDetails.lastName}
              </h5>
              <h5>
                תאריך הזמנה: {DateUtil.format(DateUtil.fromString(data.date))}
              </h5>
              <h5>
                נקודת חלוקה: {data.checkoutDetails.prefferedPickupLocation}
              </h5>
              <h5>
                כמות פריטים:{" "}
                {data.products.reduce(
                  (total, product) => total + product.amount,
                  0
                )}
              </h5>
              <h5 className="last-item">
                טלפון: {data.checkoutDetails.phoneNumber}
              </h5>
              <CartContent
                allowEdit={false}
                cartProductsWithAmount={data.products}
                totalCost={data.totalCost}
                totalCostAfterDiscount={data.totalCostAfterDiscount}
                clearCart={() => {}}
                increaseAmount={(sku: string) => {}}
                decreaseAmount={(sku: string) => {}}
                removeItem={(sku: string) => {}}
                submitButtonClicked={editOrder}
              />
              <Button
                text="ביטול הזמנה"
                onClick={() => history.push(`/cancel-order/${orderNumber}`)}
                className="cancel-order"
              />
            </>
          )}
        </div>
      </Wrapper>
    </main>
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

    > h5 {
      @media ${device.mobile} {
        font-size: 0.5rem;
      }
    }

    .last-item {
      margin-bottom: 1rem;
    }
  }

  .pickup-location {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  .cancel-order {
    width: 6rem;
    background-color: var(--clr-button-error-background);
    color: var(--clr-button-error-text);
    display: flex;
    margin: 2rem auto;
  }
`;
export default OrderPage;

import React from "react";
import styled from "styled-components";
import { useMutation } from "@tanstack/react-query";
import Loading from "../../shared/components/Loading";
import { DateUtil } from "../../utils/DateUtil";
import Select from "react-select";
import { ordersService } from "../Order/services/ordersSrevice";
import { useReport } from "./hooks/useReport";
import {
  Order,
  orderStatus,
  OrderStatus,
  orderStatusSubmitted,
} from "../../model/order/order";

const ListOfOredersPage: React.FC = () => {
  const { data, isError, isLoading } = useReport();

  const mutation = useMutation(
    (input: { orderNumber: string; status: OrderStatus }) => {
      return ordersService.changeOrderStatus(input.orderNumber, input.status);
    }
  );

  function orderFullName(order: Order) {
    return (
      order.checkoutDetails.firstName + " " + order.checkoutDetails.lastName
    );
  }

  return (
    <Wrapper>
      <h1 className="title">פירוט הזמנות</h1>
      <div className="content">
        {isLoading && <Loading />}
        {isError && <h5>לא ניתן לטעון את הדוח</h5>}
        {!isLoading && data && (
          <>
            {data.orders.length > 0 &&
              data.orders
                .sort((a, b) => {
                  const firstSort =
                    a.checkoutDetails.prefferedPickupLocation.localeCompare(
                      b.checkoutDetails.prefferedPickupLocation
                    );
                  if (firstSort !== 0) return firstSort;
                  const aName = orderFullName(a);
                  const bName = orderFullName(b);
                  return aName.localeCompare(bName);
                })
                .map((order) => {
                  return (
                    <div className="order-card" key={order.id}>
                      <h6 className="order-card-item first-item">
                        <div className="name-and-order-number">
                          <a
                            href={`${window.location.origin}/order/${order.orderNumber}`}
                          >
                            {orderFullName(order)}
                            <h6>מספר הזמנה: {order.orderNumber}</h6>
                          </a>
                        </div>

                        <Select<OrderStatus>
                          className="select-order-status"
                          classNamePrefix="select_order_status"
                          defaultValue={order.status ?? orderStatusSubmitted}
                          isClearable={false}
                          isRtl={true}
                          isSearchable={false}
                          name="order-status"
                          options={orderStatus}
                          onChange={(value, actionMeta) => {
                            mutation.mutate({
                              orderNumber: order.orderNumber,
                              status: value!,
                            });
                          }}
                        />
                      </h6>

                      <h6 className="order-card-item">
                        {order.checkoutDetails.prefferedPickupLocation}
                      </h6>

                      <h6 className="order-card-item">
                        סכום לתשלום: {order.totalCostAfterDiscount} ש"ח
                      </h6>

                      <h6 className="order-card-item">
                        {DateUtil.format(DateUtil.fromString(order.date))}
                      </h6>
                      <h6 className="order-card-item">
                        הערות: {order.checkoutDetails.comments}
                      </h6>
                    </div>
                  );
                })}
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default ListOfOredersPage;

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 10vh;
    text-align: center;
  }

  .content {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .order-card {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 80%;
    background-color: var(--clr-content-background);
    margin-bottom: 1rem;
    border-radius: var(--radius);

    .first-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .select-order-status {
        width: 50%;
      }
    }
    .order-card-item {
      margin-right: 0.5rem;
    }
  }
`;

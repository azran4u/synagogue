import React, { useState } from "react";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";
import { isNil } from "lodash";
import Button from "../../shared/components/Button";
import { OrderNotFound, ordersService } from "../Order/services/ordersSrevice";
import { useMutation, useQuery } from "@tanstack/react-query";
import Loading from "../../shared/components/Loading";

const CancelOrder: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const [isOrderNumberExists, setIsOrderNumberExsits] = useState(true);

  const { isLoading: isLoadingQuery, refetch } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => ordersService.getOrderByOrderNumber(orderNumber),
    onError: (error) => {
      if (error instanceof OrderNotFound) {
        setIsOrderNumberExsits(false);
      }
    },
  });

  const { mutate, isLoading: isLoadingMutation } = useMutation({
    mutationFn: async () => {
      await ordersService.deleteOrderByOrderNumber(orderNumber);
      setIsOrderNumberExsits(false);
    },

    onSettled: async (data, error) => {
      if (error instanceof OrderNotFound) {
        setIsOrderNumberExsits(false);
      } else {
        await refetch();
      }
    },
  });

  const history = useHistory();

  if (isNil(orderNumber)) {
    history.push("/products");
  }

  return (
    <Wrapper>
      <h1 className="title">ביטול הזמנה {orderNumber}</h1>
      <div className="content">
        {isLoadingQuery || isLoadingMutation ? (
          <Loading />
        ) : !isOrderNumberExists ? (
          <div>הזמנה {orderNumber} נמחקה</div>
        ) : (
          <>
            <h5>האם את/ה בטוח/ה שברצונך למחוק את ההזמנה?</h5>
            <Button
              text="כן אני בטוח/ה"
              className="cancel-order"
              onClick={mutate}
            />
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default CancelOrder;

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

  h5 {
    margin-top: 1rem;
  }

  .cancel-order {
    width: 6rem;
    background-color: var(--clr-button-error-background);
    color: var(--clr-button-error-text);
    margin: 0 auto;
    display: flex;
    margin-top: 3rem;
  }
`;

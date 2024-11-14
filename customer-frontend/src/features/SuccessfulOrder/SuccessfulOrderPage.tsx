import React from "react";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";
import { useAppSelector } from "../../shared/store/hooks";
import { selectCheckout } from "../Checkout/store/checkoutSlice";
import { isNil } from "lodash";

const SuccessfulOrder: React.FC = () => {
  const checkoutDetails = useAppSelector(selectCheckout);
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const history = useHistory();

  if (isNil(orderNumber)) {
    history.push("/products");
  }
  return (
    <Wrapper>
      <h1 className="title">הזמנה {orderNumber} בוצעה בהצלחה</h1>
      <div className="content">
        <h5>תודה {checkoutDetails.firstName} על רכישתך!</h5>
        <h5>ההזמנה עוברת לטיפול ונעדכן כאשר תגיע לנקודת החלוקה שבחרת </h5>
        <h5 className="pickup-location">
          {checkoutDetails.prefferedPickupLocation}
        </h5>
        <h5>תשלום יועבר בביט / פייבוקס בעת קבלת ההזמנה</h5>
        <a href={`${window.location.origin}/order/${orderNumber}`}>
          לצפייה בהזמנה לחץ/י כאן
        </a>
      </div>
    </Wrapper>
  );
};

export default SuccessfulOrder;

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

  .pickup-location {
    border-radius: --var(radius);
    background-color: var(--clr-content-background);
  }

  a {
    margin-top: 1rem;
  }
`;

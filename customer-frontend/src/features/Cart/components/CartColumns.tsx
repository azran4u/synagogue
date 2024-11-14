import React from "react";
import styled from "styled-components";

const CartColumns: React.FC = () => {
  return (
    <Wrapper>
      <h5>פריט</h5>
      <h5>מחיר</h5>
      <h5>כמות</h5>
      <h5>סיכום ביניים</h5>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
`;

export default CartColumns;

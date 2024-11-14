import React from "react";
import { useHistory } from "react-router";
import styled from "styled-components";
import { OptionalClassName } from "../../../utils/classNameInterface";
import Button from "../../../shared/components/Button";

interface EmptyCartProps extends OptionalClassName {}

const EmptyCart: React.FC<EmptyCartProps> = (props) => {
  const history = useHistory();

  return (
    <Wrapper className={`${props?.className}`}>
      <h5>נראה שאין פריטים עדיין בעגלה</h5>
      <Button
        text="מלאי את העגלה"
        onClick={() => {
          history.push("/");
        }}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;

  h5 {
    margin-bottom: 1rem;
  }
`;

export default EmptyCart;

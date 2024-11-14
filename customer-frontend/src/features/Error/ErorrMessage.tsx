import React from "react";
import styled from "styled-components";
import { OptionalClassName } from "../../utils/classNameInterface";

interface ErrorMessageProps extends OptionalClassName {}

const ErrorMessage: React.FC<ErrorMessageProps> = (props) => {
  return (
    <Wrapper className={props.className}>
      <h5>אופס... משהו השתבש</h5>
      <h5>רענן את הדף</h5>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  h5 {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
`;
export default ErrorMessage;

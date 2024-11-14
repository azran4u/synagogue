import React from "react";
import styled from "styled-components";
import { OptionalClassName } from "../../../utils/classNameInterface";
import Underline from "../../../shared/components/Underline";

interface HeaderProps extends OptionalClassName {
  text: string;
}
const Header: React.FC<HeaderProps> = (props) => {
  return (
    <Wrapper className={props.className}>
      <h2>{props.text}</h2>
      <Underline className="underline" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  text-align: center;

  h2 {
    margin-bottom: 1rem;
  }
  .underline {
    width: 6rem;
  }
`;

export default Header;

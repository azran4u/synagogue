import React from "react";
import styled, { css } from "styled-components";
import { useAppDispatch } from "../store/hooks";
import { OptionalClassName } from "../../utils/classNameInterface";
import { device } from "../../utils/device.sizes";

interface ComponentNameProps extends OptionalClassName {}

const ComponentName: React.FC<ComponentNameProps> = (props) => {
  const dispatch = useAppDispatch();

  return <Wrapper className={`${props?.className}`}></Wrapper>;
};

const Wrapper = styled.div`
  @media ${device.mobile} {
  }
`;

const PageWrapper: React.FC = ({ children }) => {
  return <Wrapper>{children}</Wrapper>;
};

interface WrapperProps {
  isSidebarOpen: boolean;
}

const WrapperWithProps = styled.aside.attrs<WrapperProps>({})<WrapperProps>`
  ${({ isSidebarOpen }) =>
    isSidebarOpen &&
    css`
      z-index: 999;
      transform: translate(0);
    `}

  @media ${device.desktop} {
    display: none;
  }
`;

export default ComponentName;

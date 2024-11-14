import React from "react";
import styled, { css } from "styled-components";
import { NavLinks } from "../../Navbar/NavLinks";
import { SidebarHeader } from "./SidebarHeader";
import { useAppSelector } from "../../../../shared/store/hooks";
import { device } from "../../../../utils/device.sizes";
import CartWithBadge from "../../../Cart/components/CartWithBadge";
import { selectSidebarIsOpen } from "../store/sidebarSlice";

const Sidebar: React.FC = () => {
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  return (
    <Wrapper isSidebarOpen={isSidebarOpen}>
      <SidebarHeader />
      <NavLinks isSidebar={true} />
      <CartWithBadge />
    </Wrapper>
  );
};

export default Sidebar;

interface WrapperProps {
  isSidebarOpen: boolean;
}

const Wrapper = styled.aside.attrs<WrapperProps>({})<WrapperProps>`
  text-align: center;
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--clr-background);
  transition: var(--transition);
  transform: translate(100%);
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

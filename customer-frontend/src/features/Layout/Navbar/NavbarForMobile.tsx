import React from "react";
import styled from "styled-components";
import { device } from "../../../utils/device.sizes";
import LinkToHome from "../../../shared/components/LinkToHome";
import { MenuButton } from "./MenuIcon";
import Logo from "./Logo";
import CartWithBadge from "../../Cart/components/CartWithBadge";

const NavbarForMobile: React.FC = () => {
  return (
    <Wrapper>
      <CartWithBadge />
      <LinkToHome>
        <Logo size="small" />
      </LinkToHome>
      <MenuButton />
    </Wrapper>
  );
};

export default NavbarForMobile;

const Wrapper = styled.nav`
  height: 10vh;
  width: 90vw;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  max-width: var(--max-width);

  @media ${device.desktop} {
    display: none;
  }
`;

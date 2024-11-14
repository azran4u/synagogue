import React from "react";
import styled from "styled-components";
import { device } from "../../../utils/device.sizes";
import { NavLinks } from "./NavLinks";
import LinkToHome from "../../../shared/components/LinkToHome";
import CartWithBadge from "../../Cart/components/CartWithBadge";
import Logo from "./Logo";

const NavbarForDesktop: React.FC = () => {
  return (
    <NavContainer>
      <LinkToHome>
        <Logo size="small" />
      </LinkToHome>
      <NavLinks />
      <CartWithBadge />
    </NavContainer>
  );
};

export default NavbarForDesktop;

const NavContainer = styled.nav`
  height: 10vh;
  width: 90vw;
  margin: 0 auto;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;

  @media ${device.mobile} {
    display: none;
  }
`;

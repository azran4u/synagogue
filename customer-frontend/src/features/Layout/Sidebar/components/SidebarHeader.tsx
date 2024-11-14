import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../Navbar/Logo";
import styled from "styled-components";
import { useAppDispatch } from "../../../../shared/store/hooks";
import { Close } from "@styled-icons/material/Close";
import { sidebarActions } from "../store/sidebarSlice";

export const SidebarHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const close = () => dispatch(sidebarActions.closeSidebar());

  return (
    <Wrapper>
      <StyledClose onClick={close} />
      <Link to="/" onClick={close}>
        <StyledLogo />
      </Link>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
`;

const StyledLogo = styled(Logo)`
  width: 3rem;
  height: 3rem;
`;

const StyledClose = styled(Close)`
  color: var(--clr-primary);
  width: 3rem;
  height: 3rem;
`;

import React from "react";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../../shared/store/hooks";
import styled from "styled-components";
import { OptionalClassName } from "../../../utils/classNameInterface";
import { device } from "../../../utils/device.sizes";
import { sidebarActions } from "../Sidebar/store/sidebarSlice";
import { useIsAdmin } from "../../Login/useIsAdmin";

interface Props extends OptionalClassName {
  isSidebar?: boolean;
}
export const NavLinks: React.FC<Props> = ({ className, isSidebar }) => {
  const dispatch = useAppDispatch();
  const isLoggedIn = useIsAdmin();

  return (
    <Wrapper className={className}>
      {links
        .filter((x) => isLoggedIn || !x.protected)
        .map(({ id, text, url }) => {
          return (
            <li
              key={id}
              onClick={
                isSidebar
                  ? () => dispatch(sidebarActions.closeSidebar())
                  : undefined
              }
            >
              <Link to={url}>{text}</Link>
            </li>
          );
        })}
    </Wrapper>
  );
};

const Wrapper = styled.ul`
  a {
    color: var(--clr-text-default);
    font-size: 1rem;
    letter-spacing: var(--spacing);
  }

  @media ${device.mobile} {
    margin-bottom: 2rem;

    a {
      display: block;
      text-align: center;
      padding: 1rem 1.5rem;
    }
  }

  @media ${device.desktop} {
    display: flex;
    justify-content: center;

    a {
      text-transform: capitalize;
      padding: 0.5rem;
      &:hover {
        border-bottom: 2px solid var(--clr-primary);
      }
    }

    li {
      margin: 0 0.5rem;
    }
  }
`;

export const links: {
  id: number;
  text: string;
  url: string;
  protected: boolean;
}[] = [
  {
    id: 1,
    text: "דף הבית",
    url: "/",
    protected: false,
  },
  {
    id: 2,
    text: "משלוח",
    url: "/shipping",
    protected: false,
  },
  {
    id: 3,
    text: "מוצרים",
    url: "/products",
    protected: false,
  },
  {
    id: 4,
    text: "תשלום",
    url: "/checkout",
    protected: false,
  },
  {
    id: 5,
    text: "התחבר/י",
    url: "/login",
    protected: false,
  },
  {
    id: 6,
    text: "ניהול אתר",
    url: "/admin",
    protected: true,
  },
];

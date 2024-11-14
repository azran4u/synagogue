import { FaBars } from "react-icons/fa";
import styled from "styled-components";
import { useAppDispatch } from "../../../shared/store/hooks";
import { OptionalClassName } from "../../../utils/classNameInterface";
import { sidebarActions } from "../Sidebar/store/sidebarSlice";

export const MenuButton: React.FC<OptionalClassName> = (props) => {
  const dispatch = useAppDispatch();
  return (
    <Wrapper
      type="button"
      className={props.className}
      onClick={() => dispatch(sidebarActions.openSidebar())}
    >
      <FaBars />
    </Wrapper>
  );
};

const Wrapper = styled.button`
  background: transparent;
  border: transparent;
  color: var(--clr-primary);
  cursor: pointer;
  svg {
    font-size: 2rem;
  }
`;

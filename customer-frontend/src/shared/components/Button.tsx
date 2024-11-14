import styled from "styled-components";
import { device } from "../../utils/device.sizes";

interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  return (
    <StyledButton className={props.className} onClick={() => props.onClick()}>
      {props.text}
    </StyledButton>
  );
};

const StyledButton = styled.button`
  text-transform: uppercase;
  background: var(--clr-primary);
  color: var(--clr-text-on-primary);
  padding: 0.375rem 0.75rem;
  letter-spacing: var(--spacing);
  display: inline-block;
  font-weight: 400;
  transition: var(--transition);
  font-size: 0.875rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  border-radius: var(--radius);
  border-color: transparent;

  @media ${device.desktop} {
    &:hover {
      opacity: 0.7;
    }
  }
`;

export default Button;

import styled, { css } from "styled-components";
import logo from "../../../assets/images/logo.svg";
import { OptionalClassName } from "../../../utils/classNameInterface";

interface LogoProps extends OptionalClassName {
  size?: "small";
}

const Logo: React.FC<LogoProps> = (props) => {
  return (
    <Wrapper
      src={logo}
      size={props?.size}
      alt="טייץ השומרון"
      className={props.className}
    />
  );
};

const Wrapper = styled.img.attrs<LogoProps>({})<LogoProps>`
  ${({ size }) =>
    size === "small" &&
    css`
      width: 3rem;
      height: 3rem;
    `}
`;

export default Logo;

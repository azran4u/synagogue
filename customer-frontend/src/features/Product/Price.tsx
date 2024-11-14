import styled from "styled-components";

interface PriceProps {
  price: number;
}

const Price: React.FC<PriceProps> = (props) => {
  return <Wrapper>{props.price && formatPrice(props.price)}</Wrapper>;
};

export function formatPrice(price: number): string {
  return `${price} ש"ח`;
}

export default Price;

const Wrapper = styled.h5`
  color: var(--clr-primary);
  @media (min-width: 992px) {
    font-size: 1.25rem;
  }
`;

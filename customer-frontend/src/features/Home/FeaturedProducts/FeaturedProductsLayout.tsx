import styled from "styled-components";
import { useAppSelector } from "../../../shared/store/hooks";
import { device } from "../../../utils/device.sizes";
import { selectFeaturedProducts } from "../../Product/store/productsSlice";
import FeaturedProducstItem from "./FeaturedProductsItem";

export const FeaturedProductsLayout = () => {
  const products = useAppSelector(selectFeaturedProducts);

  return (
    <Wrapper>
      {products &&
        products.map((product) => {
          return <FeaturedProducstItem product={product} key={product.slug} />;
        })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: grid;
  padding: 1rem 1rem 0 1rem;
  margin: 1rem auto 0 auto;
  gap: 2rem;
  width: 90vw;

  @media ${device.desktop} {
    grid-template-columns: repeat(4, 1fr);
    min-height: 46vh;
  }
`;

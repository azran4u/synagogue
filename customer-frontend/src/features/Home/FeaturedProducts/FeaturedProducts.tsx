import styled from "styled-components";
import { FeaturedProductsHeader } from "./FeaturedProductsHeader";
import { FeaturedProductsLayout } from "./FeaturedProductsLayout";

const FeaturedProducts = () => {
  return (
    <Wrapper>
      <StyledFeaturedProductsHeader />
      <FeaturedProductsLayout />
    </Wrapper>
  );
};

export default FeaturedProducts;

const Wrapper = styled.div`
  background-color: var(--clr-content-background);
  min-height: 63vh;
  margin-bottom: 1rem;
`;

const StyledFeaturedProductsHeader = styled(FeaturedProductsHeader)`
  padding-top: 2rem;
`;

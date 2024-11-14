import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FeaturedProduct } from "../../../model/featuredProduct/featuredProduct";

const FeaturedProducstItem: React.FC<{
  product: FeaturedProduct;
}> = (props) => {
  const { slug, image, description } = props.product;
  return (
    <Wrapper>
      <Link to={`/products/${slug}`}>
        <img src={image} alt={description} />
      </Link>
      <h5>{description}</h5>
    </Wrapper>
  );
};

const Wrapper = styled.article`
  img {
    display: block;
    height: 10rem;
    width: 100%;
    object-fit: cover;
  }

  h5 {
    margin-top: 1rem;
  }
`;
export default FeaturedProducstItem;

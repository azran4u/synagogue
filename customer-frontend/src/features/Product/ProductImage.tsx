import React from "react";
import styled from "styled-components";

const ProductImage: React.FC<{ image: string }> = ({ image }) => {
  return <Wrapper src={image} alt="main"></Wrapper>;
};

const Wrapper = styled.img`
  height: 10rem;
  width: 10rem;
  margin: 0 auto;
`;

export default ProductImage;

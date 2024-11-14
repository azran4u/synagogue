import React from "react";
import styled from "styled-components";
import { BackToProductsButton } from "./BackToProductsButton";
import SingleProductContentByDenierLegSize from "./SingleProductContentByDenierLegSize";
import SingleProductContentByLace from "./SingleProductContentByLace";
import { useParams } from "react-router-dom";
import Page from "../../shared/components/Page";
import { useAppSelector } from "../../shared/store/hooks";
import { selectProductSchemaBySlug } from "./store/productsSlice";
import { ProductSchema } from "../../model/product/ProductSchema";

const SingleProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const productSchema = useAppSelector(selectProductSchemaBySlug(slug));

  return (
    <Page>
      <Wrapper>
        {productSchema && (
          <>
            <BackToProductsButton className="product-center" />
            {productSchema === ProductSchema.BY_DENIER_LEG_SIZE && (
              <SingleProductContentByDenierLegSize slug={slug} />
            )}
            {productSchema === ProductSchema.BY_LACE && (
              <SingleProductContentByLace slug={slug} />
            )}
          </>
        )}
      </Wrapper>
    </Page>
  );
};
export default SingleProductPage;

const Wrapper = styled.main`
  margin: 1rem 1rem;
  .product-center {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }
`;

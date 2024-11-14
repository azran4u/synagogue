import React, { useState } from "react";
import styled from "styled-components";
import ColorSelector from "./ColorSelector";
import Price from "./Price";
import ProductDescription from "./ProductDescription";
import LaceSelector from "./LaceSelector";
import ErrorMessage from "../Error/ErorrMessage";
import { uniq } from "lodash";
import { CartItem } from "../../model/cart/CartItem";
import { useAppSelector } from "../../shared/store/hooks";
import { selectProductsBySlug } from "./store/productsSlice";
import ProductImage from "./ProductImage";
import ProductAmountButtons from "../../shared/components/ProductAmountButtons";
import AddToCart from "../Cart/components/AddToCart";
import { ProductLace } from "../../model/product/ProductLace";
import { selectLace } from "../../model/lace/selectLace";
import { Lace } from "../../model/lace/Lace";
import { selectColor } from "../../model/color/selectColor";
import { Color } from "../../model/color/Color";

interface SingleProductContentByLaceProps {
  slug: string;
}

const SingleProductContentByLace: React.FC<SingleProductContentByLaceProps> = (
  props
) => {
  const { slug } = props;

  const products = useAppSelector(selectProductsBySlug(slug)) as ProductLace[];

  const availableLaces = uniq(products.map((x) => x.lace)).map(selectLace);

  const [selectedLace, setSelectedLace] = useState<Lace>(
    availableLaces?.find((x) => x.value === "lengthwise") ?? availableLaces[0]
  );

  const availableColors = uniq(
    products.filter((x) => x.lace === selectedLace.value).map((x) => x.color)
  ).map(selectColor);

  const [selectedColor, setSelectedColor] = useState<Color>(
    availableColors.find((color) => color.value === "black") ??
      availableColors[0]
  );

  const selectedProduct = products.filter(
    (x) => x.lace === selectedLace.value && x.color === selectedColor.value
  )[0];

  const [amount, setAmount] = useState(1);

  const increaseAmount = () => setAmount(amount + 1);
  const decreaseAmount = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  function cartItem(): CartItem {
    return {
      sku: selectedProduct.sku,
      amount,
    };
  }

  const shouldRender =
    availableLaces &&
    availableColors &&
    selectedLace &&
    selectedColor &&
    selectedProduct;
  return (
    <Wrapper className="content">
      {!shouldRender && <ErrorMessage className="center" />}

      {shouldRender && (
        <>
          <ProductDescription description={selectedProduct.description} />
          <ProductImage image={selectedProduct.image} />
          <LaceSelector
            laces={availableLaces}
            initialLace={selectedLace}
            selectedLace={(denier: Lace) => {
              setSelectedLace(denier);
            }}
          />
          <Price price={selectedProduct.price} />
          <ColorSelector
            colors={availableColors}
            initialColor={selectedColor}
            selectedColor={(color: Color) => {
              setSelectedColor(color);
            }}
          />
          <hr />
          <ProductAmountButtons
            className="center"
            amount={amount}
            increase={increaseAmount}
            decrease={decreaseAmount}
          />
          <AddToCart item={cartItem()} className="center" />
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  .center {
    margin-top: 1rem;
    margin: 0 auto;
  }

  .side-by-side {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

export default SingleProductContentByLace;

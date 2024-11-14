import React, { useState } from "react";
import styled from "styled-components";
import ColorSelector from "./ColorSelector";
import LegSelector from "./LegSelector";
import SizeSelector from "./SizeSelector";
import DenierSelector from "./DenierSelector";
import Price from "./Price";
import ProductDescription from "./ProductDescription";
import ErrorMessage from "../Error/ErorrMessage";
import { CartItem } from "../../model/cart/CartItem";
import { uniq } from "lodash";
import { useAppSelector } from "../../shared/store/hooks";
import { selectProductsBySlug } from "./store/productsSlice";
import ProductImage from "./ProductImage";
import ProductAmountButtons from "../../shared/components/ProductAmountButtons";
import AddToCart from "../Cart/components/AddToCart";
import { ProductDenierLegSize } from "../../model/product/ProductDenierLegSize";
import { selectDenier } from "../../model/denier/selectDenier";
import { Denier } from "../../model/denier/Denier";
import { selectLeg } from "../../model/leg/selectLeg";
import { Leg } from "../../model/leg/Leg";
import { selectColor } from "../../model/color/selectColor";
import { Color } from "../../model/color/Color";
import { Size } from "../../model/size/Size";
import { selectSize } from "../../model/size/selectSize";

interface SingleProductContentByDenierLegSizeProps {
  slug: string;
}

const SingleProductContentByDenierLegSize: React.FC<
  SingleProductContentByDenierLegSizeProps
> = (props) => {
  const { slug } = props;

  const products = useAppSelector(
    selectProductsBySlug(slug)
  ) as ProductDenierLegSize[];

  const availableDeniers = uniq(products.map((x) => x.denier)).map(
    selectDenier
  );

  const [selectedDenier, setSelectedDenier] = useState<Denier>(
    availableDeniers.find((denier) => denier.value === "200") ??
      availableDeniers[0]
  );

  const availableLegs = uniq(
    products.filter((x) => x.denier === selectedDenier.value).map((x) => x.leg)
  ).map(selectLeg);

  const [selectedLeg, setSelectedLeg] = useState<Leg>(
    availableLegs.find((leg) => leg.value === "without-leg") ?? availableLegs[0]
  );

  const availableSizes = uniq(
    products
      .filter(
        (x) => x.denier === selectedDenier.value && x.leg === selectedLeg.value
      )
      .map((x) => x.size)
  ).map(selectSize);

  const [selectedSize, setSelectedSize] = useState<Size>(
    availableSizes.find((size) => size.value === "onesize") ?? availableSizes[0]
  );

  const availableColors = uniq(
    products
      .filter(
        (x) =>
          x.denier === selectedDenier.value &&
          x.leg === selectedLeg.value &&
          x.size === selectedSize.value
      )
      .map((x) => x.color)
  ).map(selectColor);

  const [selectedColor, setSelectedColor] = useState<Color>(
    availableColors.find((color) => color.value === "black") ??
      availableColors[0]
  );

  const product = products.filter(
    (x) =>
      x.denier === selectedDenier.value &&
      x.leg === selectedLeg.value &&
      x.size === selectedSize.value &&
      x.color === selectedColor.value
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
      sku: product.sku,
      amount,
    };
  }

  const shouldRender =
    availableDeniers &&
    availableLegs &&
    availableSizes &&
    availableColors &&
    selectedDenier &&
    selectedLeg &&
    selectedSize &&
    selectedColor &&
    product &&
    product.price;

  return (
    <Wrapper>
      {!shouldRender && <ErrorMessage className="center" />}

      {shouldRender && (
        <>
          <ProductDescription description={product.description} />
          <ProductImage image={product.image} />
          <div>
            {availableDeniers.length > 1 && (
              <DenierSelector
                deniers={availableDeniers}
                initialDenier={selectedDenier}
                selectedDenier={(denier: Denier) => {
                  setSelectedDenier(denier);
                }}
              />
            )}

            <LegSelector
              className="leg-selector"
              legs={availableLegs}
              initialLeg={selectedLeg}
              selectedLeg={(leg: Leg) => {
                setSelectedLeg(leg);
              }}
            />

            {availableSizes.length > 1 && (
              <SizeSelector
                sizes={availableSizes}
                initialSize={selectedSize}
                selectedSize={(size: Size) => {
                  setSelectedSize(size);
                }}
              />
            )}
          </div>
          <Price price={product.price} />
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

  .leg-selector {
    margin: 1rem 0;
  }
`;

export default SingleProductContentByDenierLegSize;

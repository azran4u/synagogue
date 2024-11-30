import React, { useEffect, useMemo, useState } from "react";
import { ProductShort } from "../model/product/ProductShort";
import FirebaseStorageImage from "../components/FirebaseStorageImage";
import Button from "@mui/material/Button";
import { compact, isNil, uniq } from "lodash";
import { useFormik } from "formik";
import Box from "@mui/material/Box";
import * as Yup from "yup";
import ColorPicker from "../components/ColorPicker";
import CountSelector from "../components/CountSelector";
import SelectComponent from "../components/SelectComponent";
import Title from "../components/Title";
import { cartActions } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import { useLocation } from "react-router-dom";
import { useShortProducts } from "../hooks/useProductsByKind";
import { useColors } from "../hooks/useColors";

interface ShortProductFormValues {
  length: string;
  color: string;
  count: number;
}

const ShortProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useShortProducts();
  const { data: colors } = useColors();
  const { state } = useLocation();

  if (!products || !colors) return null;

  const initialProductAndAmount = useMemo(() => {
    const passedData = state;
    if (passedData) {
      return passedData as {
        product: ProductShort;
        amount: number;
      };
    } else {
      const defaultProduct =
        products.find((product) => product.is_default) ?? products[0];

      return {
        product: defaultProduct,
        amount: 1,
      };
    }
  }, [location, products]);

  const validationSchema = Yup.object<ShortProductFormValues>({
    length: Yup.string().required(),
    color: Yup.string().required(),
    count: Yup.number().required().min(1),
  });

  const onSubmit = async (values: ShortProductFormValues) => {
    if (isNil(selectedProduct)) return;
    dispatch(
      cartActions.upsertItems([
        {
          id: selectedProduct.id,
          amount: values.count,
        },
      ])
    );
  };

  const {
    values,
    isSubmitting,
    handleChange,
    handleSubmit,
    touched,
    errors,
    setFieldValue,
  } = useFormik<ShortProductFormValues>({
    initialValues: {
      length: initialProductAndAmount.product.length,
      color: initialProductAndAmount.product.color,
      count: initialProductAndAmount.amount,
    },
    validationSchema,
    onSubmit,
  });

  const [selectedProduct, setSelectedProduct] = useState<
    ProductShort | undefined
  >(initialProductAndAmount.product);

  const [availableLength, setAvailableLength] = useState<string[]>(
    uniq(products.map((x) => x.length)) ?? []
  );

  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    setAvailableLength(uniq(products.map((x) => x.length)));

    const newAvailableColors = uniq(
      products
        .filter((product) => product.length === values.length)
        .map((x) => x.color)
    );
    setAvailableColors(newAvailableColors);

    if (!newAvailableColors.includes(values.color)) {
      values.color = newAvailableColors[0];
    }

    const newSelectedProduct = products.find(
      (p) => p.length === values.length && p.color === values.color
    );
    setSelectedProduct(newSelectedProduct);
  }, [products, values]);

  const availableColorsWithHex = useMemo(() => {
    return compact(
      availableColors.map(
        (color) =>
          colors.find((c) => c.name === color) ??
          colors.find((c) => c.name === "שחור")!
      )
    );
  }, [colors, availableColors]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <Title title={initialProductAndAmount?.product?.name ?? "Product"} />
      <form onSubmit={handleSubmit}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          maxWidth="250px"
          margin="auto"
        >
          <FirebaseStorageImage url={selectedProduct?.image ?? ""} />
          <SelectComponent
            label="אורך"
            name="length"
            value={values.length}
            options={availableLength}
            onChange={handleChange}
            error={touched.length && Boolean(errors.length)}
            helperText={errors.length}
          />

          <ColorPicker
            name="color"
            colors={availableColorsWithHex}
            value={values.color ?? ""}
            onChange={(event) => setFieldValue("color", event.target.value)}
          />

          <CountSelector
            value={values.count}
            onIncrement={() => {
              setFieldValue("count", values.count + 1);
            }}
            onDecrement={() => {
              setFieldValue("count", values.count - 1);
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{ margin: "1rem 0" }}
          >
            הוסף לסל
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ShortProductPage;

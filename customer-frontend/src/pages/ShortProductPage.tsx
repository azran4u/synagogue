import React, { useMemo } from "react";
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
import { useLocation, useParams } from "react-router-dom";
import { useShortProducts } from "../hooks/useProductsByKind";
import { useColors } from "../hooks/useColors";
import Typography from "@mui/material/Typography";

interface ShortProductFormValues {
  length: string;
  color: string;
  count: number;
}

const ShortProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { name } = useParams<{ kind: string; name: string }>();
  const { products } = useShortProducts(name);
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
        products.find((product) => product.is_default === "כן") ?? products[0];

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

  const initialValues = useMemo(() => {
    return {
      length: initialProductAndAmount.product.length,
      color: initialProductAndAmount.product.color,
      count: initialProductAndAmount.amount,
    };
  }, [initialProductAndAmount]);

  const {
    values,
    isSubmitting,
    handleChange,
    handleSubmit,
    touched,
    errors,
    setFieldValue,
  } = useFormik<ShortProductFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const availableLength = useMemo(() => {
    return uniq(products.map((x) => x.length));
  }, [products]);

  const availableColors = useMemo(() => {
    const res = uniq(
      products
        .filter((product) => product.length === values.length)
        .map((x) => x.color)
    );

    if (!res.includes(values.color)) {
      values.color = res[0];
    }

    return res;
  }, [products, values.length]);

  const selectedProduct = useMemo(() => {
    return products.find(
      (p) => p.length === values.length && p.color === values.color
    );
  }, [products, values.length, values.color]);

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
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        {initialProductAndAmount.product.description}
      </Typography>
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

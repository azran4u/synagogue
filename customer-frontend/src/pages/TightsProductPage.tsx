import React, { useEffect, useMemo } from "react";
import { ProductTights } from "../model/product/ProductTights";
import FirebaseStorageImage from "../components/FirebaseStorageImage";
import Button from "@mui/material/Button";
import { isNil, uniq } from "lodash";
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
import { useTightsProducts } from "../hooks/useProductsByKind";
import { Typography } from "@mui/material";
import { useColorMapper } from "../hooks/useColorMapper";

interface TightsProductFormValues {
  denier: string;
  leg: string;
  size: string;
  color: string;
  count: number;
}

const TightsProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { name } = useParams<{ kind: string; name: string }>();
  const { products } = useTightsProducts(name);
  const { convertColorNameToColorObject } = useColorMapper();

  const initialProductAndAmount = useMemo(() => {
    if (location && location.state) {
      return location.state as {
        product: ProductTights;
        amount: number;
      };
    }
    const defaultProduct =
      products.find((product) => product.is_default === "כן") ?? products[0];

    return {
      product: defaultProduct,
      amount: 1,
    };
  }, [products, location]);

  const validationSchema = Yup.object<TightsProductFormValues>({
    denier: Yup.string().required(),
    leg: Yup.string().required(),
    size: Yup.string().required(),
    color: Yup.string().required(),
    count: Yup.number().required().min(1),
  });

  const onSubmit = async (values: TightsProductFormValues) => {
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
      denier: initialProductAndAmount.product.denier,
      leg: initialProductAndAmount.product.leg,
      size: initialProductAndAmount.product.size,
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
  } = useFormik<TightsProductFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const availableDeniers = useMemo(() => {
    return uniq(products.map((x) => x.denier));
  }, [products]);

  const availableLegs = useMemo(() => {
    const res = uniq(
      products
        .filter((product) => product.denier === values.denier)
        .map((x) => x.leg)
    );
    if (!res.includes(values.leg)) {
      setFieldValue("leg", res[0]);
    }
    return res;
  }, [products, values.denier]);

  const availableSizes = useMemo(() => {
    const res = uniq(
      products
        .filter(
          (product) =>
            product.denier === values.denier && product.leg === values.leg
        )
        .map((x) => x.size)
    );

    if (!res.includes(values.size)) {
      setFieldValue("size", res[0]);
    }

    return res;
  }, [products, values.denier, values.leg]);

  const availableColors = useMemo(() => {
    if (!products) return [];
    const res = uniq(
      products
        .filter(
          (product) =>
            product.denier === values.denier &&
            product.leg === values.leg &&
            product.size === values.size
        )
        .map((x) => x.color)
    );

    if (!res.includes(values.color)) {
      setFieldValue("color", res[0]);
    }

    return convertColorNameToColorObject(res);
  }, [
    products,
    values.denier,
    values.leg,
    values.size,
    convertColorNameToColorObject,
  ]);

  const selectedProduct = useMemo(() => {
    return products.find(
      (p) =>
        p.denier === values.denier &&
        p.leg === values.leg &&
        p.size === values.size &&
        p.color === values.color
    );
  }, [products, values.denier, values.leg, values.size, values.color]);

  useEffect(() => {
    if (
      values.denier === initialProductAndAmount.product.denier &&
      values.leg === initialProductAndAmount.product.leg &&
      values.size === initialProductAndAmount.product.size &&
      values.color === initialProductAndAmount.product.color
    )
      return;
    setFieldValue("count", 1);
  }, [values.denier, values.leg, values.size, values.color]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      <Title
        title={initialProductAndAmount.product?.display_name ?? "Product"}
      />
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
            label="דניר"
            name="denier"
            value={values.denier}
            options={availableDeniers}
            onChange={handleChange}
            error={touched.denier && Boolean(errors.denier)}
            helperText={errors.denier}
          />

          <SelectComponent
            label="רגל"
            name="leg"
            value={values.leg}
            options={availableLegs}
            onChange={handleChange}
            error={touched.leg && Boolean(errors.leg)}
            helperText={errors.leg}
          />

          <SelectComponent
            label="מידה"
            name="size"
            value={values.size}
            options={availableSizes}
            onChange={handleChange}
            error={touched.size && Boolean(errors.size)}
            helperText={errors.size}
          />
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            {selectedProduct?.size_description}
          </Typography>
          
          <ColorPicker
            name="color"
            colors={availableColors}
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

export default TightsProductPage;

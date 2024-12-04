import React, { useMemo } from "react";
import { ProductThermal } from "../model/product/ProductThermal";
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
import { useThermalProducts } from "../hooks/useProductsByKind";
import { useColors } from "../hooks/useColors";
import Typography from "@mui/material/Typography";

interface ThermalProductFormValues {
  leg: string;
  size: string;
  color: string;
  count: number;
}

const ThermalProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { name } = useParams<{ kind: string; name: string }>();
  const { products } = useThermalProducts(name);
  const { data: colors } = useColors();

  const initialProductAndAmount = useMemo(() => {
    const passedData = location.state;
    if (passedData) {
      return passedData as {
        product: ProductThermal;
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

  const validationSchema = Yup.object<ThermalProductFormValues>({
    leg: Yup.string().required(),
    size: Yup.string().required(),
    color: Yup.string().required(),
    count: Yup.number().required().min(1),
  });

  const onSubmit = async (values: ThermalProductFormValues) => {
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
  } = useFormik<ThermalProductFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const availableLegs = useMemo(() => {
    return uniq(products.map((x) => x.leg));
  }, [products]);

  const availableSizes = useMemo(() => {
    const res = uniq(
      products
        .filter((product) => product.leg === values.leg)
        .map((x) => x.size)
    );

    if (!res.includes(values.size)) {
      values.size = res[0];
    }

    return res;
  }, [products, values.leg]);

  const availableColors = useMemo(() => {
    const res = uniq(
      products
        .filter(
          (product) =>
            product.leg === values.leg && product.size === values.size
        )
        .map((x) => x.color)
    );

    if (!res.includes(values.color)) {
      values.color = res[0];
    }

    return res;
  }, [products, values.leg, values.size]);

  const selectedProduct = useMemo(() => {
    return products.find(
      (p) =>
        p.leg === values.leg &&
        p.size === values.size &&
        p.color === values.color
    );
  }, [products, values.leg, values.size, values.color]);

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

export default ThermalProductPage;

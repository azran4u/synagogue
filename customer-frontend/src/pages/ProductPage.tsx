import React from "react";
import TightsProductPage from "./TightsProductPage";
import { useNavigate, useParams } from "react-router";
import { ProductSchema } from "../model/ProductSchema";
import { Box, Button } from "@mui/material";
import LaceProductPage from "./LaceProductPage";
import ShortProductPage from "./ShortProductPage";
import ThermalProductPage from "./ThermalProductPage";
import { useActiveProducts } from "../hooks/useProducts";

const ProductPage: React.FC = () => {
  const { kind } = useParams<{ kind: string; name: string }>();
  const { products } = useActiveProducts();
  const navigate = useNavigate();

  const backButtonText = "חזרה לקטלוג המוצרים";

  return (
    <Box>
      {kind && products.length > 0 && (
        <>
          <Button
            variant="contained"
            size="small"
            sx={{
              margin: "1rem 1rem",
            }}
            onClick={() => {
              navigate("/");
            }}
          >
            {backButtonText}
          </Button>
          {kind === ProductSchema.TIGHTS && <TightsProductPage />}
          {kind === ProductSchema.LACE && <LaceProductPage />}
          {kind === ProductSchema.SHORT && <ShortProductPage />}
          {kind === ProductSchema.THERMAL && <ThermalProductPage />}
        </>
      )}
    </Box>
  );
};
export default ProductPage;

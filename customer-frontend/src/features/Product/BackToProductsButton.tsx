import React from "react";
import { useHistory } from "react-router-dom";
import Button from "../../shared/components/Button";
import { OptionalClassName } from "../../utils/classNameInterface";

export const BackToProductsButton: React.FC<OptionalClassName> = (props) => {
  const history = useHistory();
  return (
    <Button
      className={props.className}
      text="חזרה לקטלוג המוצרים"
      onClick={() => history.push("/products")}
    />
  );
};

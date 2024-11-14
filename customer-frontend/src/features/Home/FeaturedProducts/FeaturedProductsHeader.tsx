import React from "react";
import SubHeader from "../../Layout/Header/Header";

interface ClassName {
  className?: string;
}
export const FeaturedProductsHeader: React.FC<ClassName> = ({ className }) => {
  return <SubHeader text="המוצרים שלנו" className={className} />;
};

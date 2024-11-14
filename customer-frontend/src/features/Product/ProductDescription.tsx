interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = (props) => {
  return <h2>{props.description}</h2>;
};

export default ProductDescription;

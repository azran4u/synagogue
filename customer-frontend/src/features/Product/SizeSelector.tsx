import { Size } from "../../model/size/Size";
import ValueLabelSelector from "../../shared/components/ValueLabelSelector";

interface SizeSelectorProps {
  sizes: Size[];
  initialSize: Size;
  selectedSize: (size: Size) => void;
}
const SizeSelector: React.FC<SizeSelectorProps> = (props) => {
  return (
    <ValueLabelSelector<Size>
      values={props.sizes}
      initialValue={props.initialSize}
      selectedValue={props.selectedSize}
    />
  );
};

export default SizeSelector;

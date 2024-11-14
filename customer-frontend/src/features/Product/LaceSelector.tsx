import { Lace } from "../../model/lace/Lace";
import ValueLabelSelector from "../../shared/components/ValueLabelSelector";

interface LaceSelectorProps {
  laces: Lace[];
  initialLace: Lace;
  selectedLace: (lace: Lace) => void;
}
const LaceSelector: React.FC<LaceSelectorProps> = (props) => {
  return (
    <ValueLabelSelector<Lace>
      values={props.laces}
      initialValue={props.initialLace}
      selectedValue={props.selectedLace}
    />
  );
};

export default LaceSelector;

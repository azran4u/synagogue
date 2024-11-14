import { Denier } from "../../model/denier/Denier";
import ValueLabelSelector from "../../shared/components/ValueLabelSelector";

interface DenierSelectorProps {
  deniers: Denier[];
  initialDenier: Denier;
  selectedDenier: (denier: Denier) => void;
}

const DenierSelector: React.FC<DenierSelectorProps> = (props) => {
  return (
    <ValueLabelSelector<Denier>
      values={props.deniers}
      initialValue={props.initialDenier}
      selectedValue={props.selectedDenier}
    />
  );
};

export default DenierSelector;

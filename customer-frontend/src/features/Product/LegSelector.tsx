import { Leg } from "../../model/leg/Leg";
import ValueLabelSelector from "../../shared/components/ValueLabelSelector";
import { OptionalClassName } from "../../utils/classNameInterface";

interface LegSelectorProps extends OptionalClassName {
  legs: Leg[];
  initialLeg: Leg;
  selectedLeg: (leg: Leg) => void;
}
const LegSelector: React.FC<LegSelectorProps> = (props) => {
  return (
    <ValueLabelSelector<Leg>
      className={props?.className}
      values={props.legs}
      initialValue={props.initialLeg}
      selectedValue={props.selectedLeg}
    />
  );
};

export default LegSelector;

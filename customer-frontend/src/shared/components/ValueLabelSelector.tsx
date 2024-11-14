import { ValueLabel } from "../../utils/valueLabel/ValueLabel";
import Select from "react-select";
import styled from "styled-components";
import { OptionalClassName } from "../../utils/classNameInterface";

interface ValueLabelSelectorProps<T extends ValueLabel>
  extends OptionalClassName {
  values: T[];
  initialValue: T;
  selectedValue: (selected: T) => void;
}
function ValueLabelSelector<T extends ValueLabel>(
  props: ValueLabelSelectorProps<T>
) {
  return (
    <Wrapper className={props?.className}>
      {props.values && (
        <Select<T>
          className="basic-single"
          classNamePrefix="select"
          defaultValue={props.initialValue}
          isClearable={false}
          isRtl={true}
          isSearchable={false}
          name="value-label-selector"
          options={props.values}
          onChange={(value, actionMeta) => props.selectedValue(value!)}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  .basic-single {
    width: 10rem;
  }
`;
export default ValueLabelSelector;

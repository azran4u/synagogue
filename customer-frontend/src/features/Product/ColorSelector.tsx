import { useEffect, useState } from "react";
import styled from "styled-components";
import { Color } from "../../model/color/Color";

interface ColorSelectorProps {
  colors: Color[];
  initialColor: Color;
  selectedColor: (color: Color) => void;
}
const ColorSelector: React.FC<ColorSelectorProps> = (props) => {
  const [selectedColor, setSelectedColor] = useState<Color>(props.initialColor);
  const [radioButtonGroupName] = useState<string>(`color-selector`);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const color = props.colors.find((color) => color.value === e.target.value)!;
    if (color !== selectedColor) setSelectedColor(color);
  }

  useEffect(() => {
    props.selectedColor(selectedColor);
  }, [props, selectedColor]);

  return (
    <Wrapper>
      <>
        <h5>צבע: {selectedColor.label}</h5>
        <div className="colors-list">
          {props.colors.length > 0 &&
            props.colors.map((color, index) => {
              return (
                <Input
                  // id={`color-selector-input-${index}`}
                  key={color.value}
                  colorObj={color}
                  type="radio"
                  checked={color.value === selectedColor.value}
                  name={radioButtonGroupName}
                  value={color.value}
                  onChange={handleInputChange}
                />
              );
            })}
        </div>
      </>
    </Wrapper>
  );
};

interface StyledButtonProps {
  colorObj: Color;
}
const Input = styled.input.attrs<StyledButtonProps>({})<StyledButtonProps>`
  cursor: pointer;
  /* hiding browser el */
  appearance: none;
  /* Safari support */
  -webkit-appearance: none;
  border-radius: 50%;
  height: 1.2rem;
  width: 1.2rem;
  border: 0.05rem solid black;
  background-color: ${(props) => props.colorObj.cssColor};
  &:checked {
    height: 2rem;
    width: 2rem;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  .colors-list {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
`;

export default ColorSelector;

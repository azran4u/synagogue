import React from "react";
import styled from "styled-components";
import Button from "../../shared/components/Button";
import { useHistory } from "react-router";

const Report: React.FC = () => {
  const history = useHistory();

  return (
    <Wrapper>
      <h1 className="title">דוח הזמנות</h1>
      <div className="content">
        <Button
          text="פירוט הזמנות"
          onClick={() => history.push("/admin/orders")}
        />

        <Button
          text="הזמנות לפי נקודת חלוקה"
          onClick={() => history.push("/admin/pickup-histogram")}
        />

        <Button
          text="דוח ספקים"
          onClick={() => history.push("/admin/suppliers-bom")}
        />
      </div>
    </Wrapper>
  );
};

export default Report;

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 10vh;
    text-align: center;
  }

  .content {
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
  }
`;

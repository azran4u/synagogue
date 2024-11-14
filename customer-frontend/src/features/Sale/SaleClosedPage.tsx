import React from "react";
import styled from "styled-components";

const SaleClosed: React.FC = () => {
  return (
    <Wrapper>
      <h1 className="title">המכירה סגורה כעת</h1>
      <div className="content"></div>
    </Wrapper>
  );
};

export default SaleClosed;

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 10vh;
    text-align: center;
  }

  .content {
    min-height: 70vh;
  }
`;

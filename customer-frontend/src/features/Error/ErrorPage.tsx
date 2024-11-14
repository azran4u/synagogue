import React from "react";
import styled from "styled-components";

const ErrorPage: React.FC = () => {
  return (
    <Wrapper>
      <h1 className="title">מצטערים</h1>
      <h5 className="content">הדף שחיפשת אינו קיים...</h5>
    </Wrapper>
  );
};

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
    flex-direction: row;
    justify-content: center;
  }
`;

export default ErrorPage;

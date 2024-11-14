import React from "react";
import styled from "styled-components";
import Login from "./Login";

const LoginPage: React.FC = () => {
  return (
    <main>
      <Wrapper className="page">
        <div className="title">
          <h1>התחברות</h1>
        </div>
        <div className="content">
          <Login />
        </div>
      </Wrapper>
    </main>
  );
};

const Wrapper = styled.div`
  width: 90vw;
  margin: 0 auto;

  .title {
    min-height: 15vh;
    text-align: center;
  }

  .content {
    min-height: 65vh;
  }
`;
export default LoginPage;

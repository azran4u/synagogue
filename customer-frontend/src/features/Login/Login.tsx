import React from "react";
import styled from "styled-components";
import { OptionalClassName } from "../../utils/classNameInterface";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../shared/services/firebase-config";
import { login, logout } from "../../shared/services/firebase-auth";
import Button from "../../shared/components/Button";
import Loading from "../../shared/components/Loading";
import ErrorPage from "../Error/ErrorPage";

interface LoginProps extends OptionalClassName {}

const Login: React.FC<LoginProps> = (props) => {
  const [user, loading, error] = useAuthState(auth);
  return (
    <Wrapper className={props.className}>
      {loading && <Loading />}
      {error && <ErrorPage />}
      {user && (
        <>
          <h5>הי {user.displayName}</h5>
          <h5>נראה שאת/ה כבר מחובר</h5>
          <Button text="התנתק" onClick={logout} />
        </>
      )}
      {!user && <Button text="התחבר עם חשבון גוגל" onClick={login} />}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;
export default Login;

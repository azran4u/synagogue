import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { login, logout } from "../services/firebase-auth";
import { Box, Button, CircularProgress } from "@mui/material";

const Login: React.FC = (props) => {
  const [user, loading, error] = useAuthState(auth);
  return (
    <Box>
      {loading && <CircularProgress />}
      {user && (
        <>
          <h5>הי {user.displayName}</h5>
          <h5>נראה שאת/ה כבר מחובר</h5>
          <Button onClick={logout} title="התנתק" />
        </>
      )}
      {!user && <Button title="התחבר עם חשבון גוגל" onClick={login} />}
    </Box>
  );
};

export default Login;

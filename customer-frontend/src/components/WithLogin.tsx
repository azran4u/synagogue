import React from "react";
import { useAuth } from "../hooks/useAuth";


export const WithLogin: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : null;
};

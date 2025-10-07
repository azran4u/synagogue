import React from "react";
import { useUser } from "../hooks/useUser";

export const WithLogin: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoggedIn } = useUser();
  return isLoggedIn ? children : null;
};

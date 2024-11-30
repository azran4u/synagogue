import { Route, Navigate } from "react-router-dom";
import { useIsAdmin } from "../hooks/useIsAdmin";

//@ts-ignore
const ProtectedRoute = ({ children, ...rest }) => {
  const isAllowed = useIsAdmin();
  const fallbackRoute = "/";

  return (
    <Route
      {...rest}
      element={isAllowed ? children : <Navigate to={fallbackRoute} />}
    ></Route>
  );
};
export default ProtectedRoute;

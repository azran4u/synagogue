import { Route, Redirect } from "react-router-dom";
import { useIsAdmin } from "../../features/Login/useIsAdmin";

//@ts-ignore
const ProtectedRoute = ({ children, ...rest }) => {
  const isAllowed = useIsAdmin();
  const fallbackRoute = "/";

  return (
    <Route
      {...rest}
      render={() => {
        return isAllowed ? children : <Redirect to={fallbackRoute}></Redirect>;
      }}
    ></Route>
  );
};
export default ProtectedRoute;

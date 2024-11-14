import { Link } from "react-router-dom";

const LinkToHome: React.FC = ({ children }: any) => {
  return <Link to="/">{children}</Link>;
};

export default LinkToHome;

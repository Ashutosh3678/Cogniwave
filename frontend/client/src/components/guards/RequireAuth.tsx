import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useRecoilValue } from "recoil";
import { authStatus } from "../../state/auth";

type Props = {
  children: React.ReactNode;
};

const RequireAuth = ({ children }: Props) => {
  const { isAuthenticated } = useAuthContext();
  const status = useRecoilValue(authStatus);
  const location = useLocation();

  const allowed = isAuthenticated || status.isAuthenticated;

  if (!allowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;


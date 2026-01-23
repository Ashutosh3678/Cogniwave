import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useRecoilValue } from "recoil";
import { authState } from "../../state/auth";

interface LoginGuardProps {
  children: React.ReactNode;
}

// This component can be used as the element for the /login route.
// If the user is authenticated, it immediately redirects to the appropriate dashboard.
export default function LoginGuard({ children }: LoginGuardProps) {
  const { isAuthenticated } = useAuthContext();
  const auth = useRecoilValue(authState);

  // Synchronous redirect if auth is already true.
  if (isAuthenticated) {
    const role = auth.user?.globalRole;

    if (role === "SUPERADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "SUPPLIER") {
      return <Navigate to="/supplier/dashboard" replace />;
    }
    if (auth.needsStoreSetup) {
      return <Navigate to="/store/create" replace />;
    }
    if (role === "STORE_OWNER" || role === "READ_ONLY" || auth.effectiveStore) {
      return <Navigate to="/store/dashboard" replace />;
    }

    return <Navigate to="/store/dashboard" replace />;
  }

  // Not authenticated -> render login UI (children)
  return <>{children}</>;
}


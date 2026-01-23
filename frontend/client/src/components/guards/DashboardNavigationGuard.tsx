import { useEffect } from "react";
// useNavigate removed as unused
import { useAuthContext } from "../../context/AuthContext";

export default function DashboardNavigationGuard() {
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Prevent back navigation inside SPA and attempts to go back via history
    // Push a duplicate state so the first back stays on the same page
    window.history.pushState(null, "", window.location.href);

    const onPopState = () => {
      // If authenticated, keep user on dashboard by pushing state again
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", onPopState);

    // Optional: intercept beforeunload to warn user (keeps behaviour friendly)
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // returnValue set makes some browsers show a confirmation dialog
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isAuthenticated]);

  return null; // no render UI
}


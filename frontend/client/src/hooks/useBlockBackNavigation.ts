import { useEffect } from "react";

export const useBlockBackNavigation = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const target = "/dashboard";

    const pushState = () => {
      window.history.pushState(null, "", target);
    };

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      pushState();
    };

    pushState();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [active]);
};



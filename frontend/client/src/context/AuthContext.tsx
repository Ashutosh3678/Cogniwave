import React, { createContext, useContext, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { authState, authStatus } from "../state/auth";

type AuthContextValue = {
  user: any | null;
  isAuthenticated: boolean;
  effectiveStore :any
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  effectiveStore: null,
});



export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useRecoilValue(authState);
  const status = useRecoilValue(authStatus);

  const value = useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: status.isAuthenticated,
      effectiveStore : status.effectiveStore
    }),
    [auth.user, status.isAuthenticated, status.effectiveStore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuthContext = () => useContext(AuthContext);


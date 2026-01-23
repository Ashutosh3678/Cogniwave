import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { authState, clearAuthState } from "../state/auth";
import { useCallback } from "react";

export const useLogout = () => {
    const navigate = useNavigate();
    const setAuth = useSetRecoilState(authState);

    const logout = useCallback(() => {
        // 1. Clear local storage
        localStorage.removeItem("synapstore:auth");
        localStorage.removeItem("auth:encUser");

        // 2. Reset Recoil state
        setAuth(clearAuthState());

        // 3. Navigate to home (login)
        navigate("/", { replace: true });
    }, [navigate, setAuth]);

    return logout;
};

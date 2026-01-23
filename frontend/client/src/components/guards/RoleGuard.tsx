import React from "react";
import { Navigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../../state/auth";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[]; // e.g. ["SUPERADMIN", "STORE_OWNER"]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const auth = useRecoilValue(authState);
    const userRole = auth.user?.globalRole || "USER"; // Default to USER if null

    if (allowedRoles.includes(userRole)) {
        return <>{children}</>;
    }

    // If not allowed, redirect based on their ACTUAL role
    if (userRole === "SUPERADMIN") {
        return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "SUPPLIER") {
        return <Navigate to="/supplier/dashboard" replace />;
    }
    if (userRole === "STORE_OWNER") {
        return <Navigate to="/store/dashboard" replace />;
    }
    if (userRole === "READ_ONLY") {
        return <Navigate to="/store/dashboard" replace />;
    }

    // Fallback for unknown roles or strictly unauthorized
    return <Navigate to="/login" replace />;
}

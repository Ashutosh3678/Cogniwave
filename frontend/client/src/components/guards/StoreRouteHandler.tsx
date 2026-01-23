
import { useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import StoreOwnerDashboard from "../../pages/StoreOwnerDashboard";

const StoreRouteHandler = () => {
    const { slug } = useParams();
    const { user, isAuthenticated, effectiveStore } = useAuthContext();

    // Check if user is logged in AND has access to THIS store
    // access can be: owner, manager, staff
    // AND the store being accessed matches the effective store context (simplification)

    const isOwnerOrStaff = isAuthenticated &&
        effectiveStore?.slug === slug &&
        (user?.globalRole === "STORE_OWNER" ||
            user?.globalRole === "MANAGER" ||
            user?.globalRole === "STAFF" ||
            !user?.globalRole); // Allow null role (basic User) if they have store context

    if (isOwnerOrStaff) {
        return <StoreOwnerDashboard />;
    }

    // Otherwise, show public read-only view

};

export default StoreRouteHandler;

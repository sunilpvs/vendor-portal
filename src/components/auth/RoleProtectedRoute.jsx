import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
    const { userRoles, rolesLoading } = useContext(AppContext);

    if (rolesLoading) {
        return <div>Loading...</div>;
    }

    const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleProtectedRoute;

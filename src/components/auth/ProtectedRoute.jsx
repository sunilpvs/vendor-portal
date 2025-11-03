import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import {checkAuth} from "../../services/auth/auth";

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const verify = async () => {
            try {
                const valid = await checkAuth();
                setIsAuthenticated(valid);
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsAuthenticated(false);
            } finally {
                setChecking(false);
            }
        };
        verify();
    }, []);

    if (checking) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
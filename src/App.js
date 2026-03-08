import { useEffect, useState } from "react";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Dashboard from "./pages/dashboard";


import LoginPage from "./pages/auth/LoginPage"; 
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import UserProfile from "./pages/profile/UserProfile";
import ActivityLog from "./pages/activity/ActivityLog";
import VmsRequest from "./pages/vms/VmsRequest";

import DumpVendorAdmin from "./pages/vms/DumpVendorAdmin";
import AllRfiListAdmin from "./pages/vms/AllRfiListAdmin";

import VendorInfo from "./pages/vms/VendorInfoPage";

import { getUserRole } from "./services/auth/userDetails";

import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import NotFound404 from "./pages/error/404NotFound";
import MyRfi from "./pages/vms/MyRfi";

const App = () => {
    const [theme, colorMode] = useMode();
    const [userRoles, setUserRoles] = useState([]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await getUserRole();
                const data = response?.data;
                const roles = Array.isArray(data)
                    ? data.map((item) => Number(item?.role_id)).filter((role) => !Number.isNaN(role))
                    : data?.role_id !== undefined
                        ? [Number(data.role_id)].filter((role) => !Number.isNaN(role))
                        : [];
                setUserRoles(roles);
            } catch (error) {
                console.error("Error fetching user role:", error);
                setUserRoles([]);
            }
        };

        fetchUserRole();
    }, []);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Toaster position="top-center" reverseOrder={false} />
                <AppRoutes userRoles={userRoles} />

            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

const AppRoutes = ({ userRoles = [] }) => {
    const isVendorRole = userRoles.includes(8);
    const isAdminRole = userRoles.some((role) => [1, 6, 7].includes(role));

    return (
        <Routes>
            {/* Public Route */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected routes inside DashboardLayout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />

                {/* Common routes */}
                <Route path="profile" element={<UserProfile />} />
                <Route path="activity" element={<ActivityLog />} />

                {/* Role 8 routes */}
                {isVendorRole && <Route path="request-vendor" element={<VmsRequest />} />}
                {isVendorRole && <Route path="request-vendor/refId=:refId" element={<VmsRequest />} />}
                {isVendorRole && <Route path="vendor-info" element={<VendorInfo />} />}
                {isVendorRole && <Route path="myrfi" element={<MyRfi />} />}

                {/* Role 1, 6, 7 routes */}
                {isAdminRole && <Route path="dump-vendor-admin" element={<DumpVendorAdmin />} />}
                {isAdminRole && <Route path="dump-vendor-admin/refId=:refId" element={<DumpVendorAdmin />} />}
                {isAdminRole && <Route path="all-vendor-rfis" element={<AllRfiListAdmin />} />}
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound404 />} />
        </Routes>
    );
};

export default App;


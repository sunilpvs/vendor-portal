import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Dashboard from "./pages/dashboard";

import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";

import UserProfile from "./pages/profile/UserProfile";
import ActivityLog from "./pages/activity/ActivityLog";

import VmsRequest from "./pages/vms/VmsRequest";
import DumpVendorAdmin from "./pages/vms/DumpVendorAdmin";
import AllRfiListAdmin from "./pages/vms/AllRfiListAdmin";
import VendorInfo from "./pages/vms/VendorInfoPage";


import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

import NotFound404 from "./pages/error/404NotFound";
import MyRfi from "./pages/vms/MyRfi";


const ADMIN_ROLES = [1, 6, 7];
const VENDOR_ROLE = 8;

const App = () => {
    const [theme, colorMode] = useMode();
    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Toaster position="top-center" reverseOrder={false} />
                <AppRoutes />
            </ThemeProvider>
        </ColorModeContext.Provider>

    );

};

const AppRoutes = () => {
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
                <Route
                    path="request-vendor"
                    element={
                        <RoleProtectedRoute allowedRoles={[VENDOR_ROLE]}>
                            <VmsRequest />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="vendor-info"
                    element={
                        <RoleProtectedRoute allowedRoles={[VENDOR_ROLE]}>
                            <VendorInfo />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="myrfi"
                    element={
                        <RoleProtectedRoute allowedRoles={[VENDOR_ROLE]}>
                            <MyRfi />
                        </RoleProtectedRoute>
                    }
                />



                {/* Role 1, 6, 7 routes */}
                <Route
                    path="dump-vendor-admin"
                    element={
                        <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                            <DumpVendorAdmin />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="all-vendor-rfis"
                    element={
                        <RoleProtectedRoute allowedRoles={ADMIN_ROLES}>
                            <AllRfiListAdmin />
                        </RoleProtectedRoute>
                    }
                />
        </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound404 />} />
        </Routes>
    );
};

export default App;

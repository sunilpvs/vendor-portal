import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Dashboard from "./pages/dashboard";


import LoginPage from "./pages/auth/LoginPage"; 
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import UserProfile from "./pages/profile/UserProfile";
import ActivityLog from "./pages/activity/ActivityLog";
import VmsRequest from "./pages/vms/VmsRequest";

import VendorInfo from "./pages/vms/VendorInfoPage";


import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import NotFound404 from "./pages/error/404NotFound";
import MyRfi from "./pages/vms/MyRfi";

const App = () => {
    const [theme, colorMode] = useMode();
    const location = useLocation();


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

const AppRoutes = () => (
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

            <Route path="profile" element={<UserProfile />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path={"request-vendor"} element={<VmsRequest />} />
            <Route path={"request-vendor/refId=:refId"} element={<VmsRequest />} />
            <Route path={"vendor-info"} element={<VendorInfo />} />
            <Route path={"myrfi"} element={<MyRfi />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound404 />} />
    </Routes>
);

export default App;


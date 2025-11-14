import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MyProSidebarProvider } from "./pages/global/sidebar/sidebarContext";

import Topbar from "./pages/global/Topbar";

import Dashboard from "./pages/dashboard";
import Calendar from "./pages/calendar";

import City from "./pages/city/City";
import State from "./pages/state/State";
import Country from "./pages/country/Country";
import Designation from "./pages/designation/Designation";
import Department from "./pages/department/Department";
import ContactType from "./pages/contacttype/ContactType";
import CostCenterType from "./pages/costcentertype/CostcenterType";

import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import { Toaster } from "react-hot-toast";
import DashboardLayout from "./components/DashboardLayout";
import UserProfile from "./pages/profile/UserProfile";
import ActivityLog from "./pages/activity/ActivityLog";
import InitiateVendor from "./pages/vms/InitiateVendor";
import VmsRequest from "./pages/vms/VmsRequest";
import CostCenter from "./pages/costcenter/CostCenter";
import StatusPage from "./pages/vms/StatusPage";
import EntityRfqPage from "./pages/vms/EntityRfqPage";

const App = () => {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  // const isLoginPage = location.pathname === "/login";

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
          
   
            <Route path="calendar" element={<Calendar />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="activity" element={<ActivityLog />} />
            <Route path={"initiate-vendor"} element={<InitiateVendor />} />
            <Route path={"request-vendor"} element={<VmsRequest />} />
            <Route path={"status"} element={<StatusPage />} />
            <Route path={"rfqpage"} element={<EntityRfqPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);

export default App;

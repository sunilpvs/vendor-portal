import {MyProSidebarProvider} from "../pages/global/sidebar/sidebarContext";
import Topbar from "../pages/global/Topbar";
import {Outlet} from "react-router-dom";

const DashboardLayout = () => {

    return (
        <>
            <MyProSidebarProvider>
                <div style={{ height: "100%", width: "100%" }}>
                    <main>
                        <Topbar />
                            <Outlet />
                    </main>
                </div>
            </MyProSidebarProvider>

        </>
    )

}

export default DashboardLayout;
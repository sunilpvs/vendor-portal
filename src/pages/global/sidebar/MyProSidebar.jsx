// docs https://github.com/azouaoui-med/react-pro-sidebar
import {useContext, useEffect, useState} from "react";
import { Menu, Sidebar, MenuItem, SubMenu } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";

import { useSidebarContext } from "./sidebarContext";

import { AppContext } from "../../../context/AppContext";

import { Link } from "react-router-dom";
import { tokens } from "../../../theme";
import { useTheme, Box, Typography, IconButton } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SwitchRightOutlinedIcon from "@mui/icons-material/SwitchRightOutlined";
import SwitchLeftOutlinedIcon from "@mui/icons-material/SwitchLeftOutlined";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";



import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {QuestionMark} from "@mui/icons-material";
import { getUserRole } from "../../../services/auth/userDetails";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);


    return (
        <MenuItem
            active={selected === title}
            style={{ color: colors.grey[100] }}
            onClick={() => setSelected(title)}
            icon={icon}
            routerLink={<Link to={to} />}
        >
            <Typography>{title}</Typography>
        </MenuItem>
    );
};

const MyProSidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [selected, setSelected] = useState("Dashboard");
    const { sidebarRTL, setSidebarRTL, sidebarImage } = useSidebarContext();
    const { collapseSidebar, toggleSidebar, collapsed, broken } = useProSidebar();
    const isDark = theme.palette.mode === 'dark';

    const { userData } = useContext(AppContext);
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

    const isVendorRole = userRoles.includes(8);
    const isAdminRole = userRoles.some((role) => [1, 6, 7].includes(role));

    return (

        <Box
            sx={{
                position: "sticky",
                display: "flex",
                height: "100vh",
                top: 0,
                bottom: 0,
                zIndex: 10000,
                "& .sidebar": {
                    border: "none",
                },
                "& .menu-icon": {
                    backgroundColor: "transparent !important",
                },
                "& .menu-item": {
                    color: `${theme.palette.mode === 'dark' ? colors.greenAccent[500] : colors.grey[100]} !important`,
                    backgroundColor: "transparent !important",
                },

                "& .menu-anchor": {
                    color: `${isDark ? colors.greenAccent[500] : colors.grey[100]} !important`,
                    backgroundColor: "transparent !important",
                    transition: "color 0.2s ease",
                },

                "& .menu-anchor:hover": {
                    color: `${isDark ? colors.blueAccent[500] : colors.primary[700]} !important`,
                    backgroundColor: "transparent !important",
                },

                "& .menu-anchor.ps-active": {
                    color: `${colors.greenAccent[500]} !important`,
                },

                "& .menu-item:hover": {
                    color: `${colors.blueAccent[500]} !important`,
                    backgroundColor: "transparent !important",
                },
                "& .menu-item.active": {
                    color: `${colors.greenAccent[500]} !important`,
                    backgroundColor: "transparent !important",
                },
                "& .ps-submenu-content, & .daWgIu": {
                    backgroundColor: "transparent !important",
                    boxShadow: "none !important",
                    border: "none !important",
                    paddingLeft: "20px !important",
                },
                "& .ps-submenu-content .menu-item.active": {
                    color: `${colors.blueAccent[500]} !important`, // blue active submenu item
                    backgroundColor: "transparent !important",
                },
            }}
        >
            <Sidebar
                breakPoint="md"
                rtl={sidebarRTL}
                backgroundColor={colors.primary[400]}
                image={sidebarImage}
            >
                <Menu iconshape="square">
                    <MenuItem
                        icon={
                            collapsed ? (
                                <MenuOutlinedIcon onClick={() => collapseSidebar()} />
                            ) : sidebarRTL ? (
                                <SwitchLeftOutlinedIcon
                                    onClick={() => setSidebarRTL(!sidebarRTL)}
                                />
                            ) : (
                                <SwitchRightOutlinedIcon
                                    onClick={() => setSidebarRTL(!sidebarRTL)}
                                />
                            )
                        }
                        style={{
                            margin: "10px 0 20px 0",
                            color: colors.grey[100],
                        }}
                    >
                        {!collapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <Typography variant="h3" color={colors.grey[100]}>
                                    {"VENDOR"}
                                </Typography>
                                <IconButton 
                                    onClick={
                                        broken ? () => toggleSidebar() : () => collapseSidebar()
                                    }
                                >
                                    <CloseOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>

                    {!collapsed && (
                        <Box mb="25px">
                           <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                sx={{
                                    "& .avater-image": {
                                        backgroundColor: colors.primary[500],
                                    },
                                }}
                            >
                                <img
                                    className="avater-image"
                                    alt="profile user"
                                    width="100px"
                                    height="100px"
                                    src={userData?.profile_pic ? `data:image/jpeg;base64,${userData.profile_pic}` : "/assets/vms-user-logo.svg"}
                                    style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover" }}
                                />
                            </Box>
                            <Box textAlign="center">
                                <Typography
                                    variant="h3"
                                    color={colors.grey[100]}
                                    fontWeight="bold"
                                    sx={{ m: "10px 0 0 0" }}
                                >
                                    {userData?.f_name+" "+userData?.l_name}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Box paddingLeft={collapsed ? undefined : "10%"}>
                        <Item
                            title="Dashboard"
                            to="/"
                            icon={<HomeOutlinedIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />

                        {isVendorRole && (
                            <Item
                                title="Request Vendor"
                                to="/request-vendor"
                                icon={<RequestQuoteOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}

                        {isVendorRole && (
                            <Item
                                title="My RFIs"
                                to="/myrfi"
                                icon={<HowToRegIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}

                        {isVendorRole && (
                            <Item
                                title="Vendor Info"
                                to="/vendor-info"
                                icon={<BarChartOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}

                        {isAdminRole && (
                            <Item
                                title="Dump Vendor Admin"
                                to="/dump-vendor-admin"
                                icon={<PeopleOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}

                        {isAdminRole && (
                            <Item
                                title="All Vendor RFIs"
                                to="/all-vendor-rfis"
                                icon={<RequestQuoteOutlinedIcon />}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}

                        <Item
                            title="My Profile"
                            to="/profile"
                            icon={<PersonOutlineIcon />}
                            selected={selected}
                            setSelected={setSelected}
                        />                        


                    </Box>
                </Menu>
            </Sidebar>
        </Box>
    );
};

export default MyProSidebar;


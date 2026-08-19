import { createContext, useCallback, useEffect, useState } from "react";
import { getUserDetails, getUserRole } from "../services/auth/userDetails";
import { parseUserRoles } from "../utils/parseUserRoles";

export const AppContext = createContext();

const initialUserData = null;

export const AppContextProvider = ({ children }) => {
    const [userData, setUserData] = useState(initialUserData);
    const [userRoles, setUserRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        setRolesLoading(true);
        try {
            const response = await getUserRole();
            setUserRoles(parseUserRoles(response?.data));
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRoles([]);
        } finally {
            setRolesLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserDetails();
                setUserData(response.data.userData);
            } catch (error) {
                console.warn("User Not Authenticated");
                setUserData(initialUserData);
                setUserRoles([]);
                setRolesLoading(false);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (userData) {
            fetchRoles();
        }
    }, [userData, fetchRoles]);

    const contextValue = {
        userData,
        setUserData,
        userRoles,
        rolesLoading,
        fetchRoles,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

import {createContext, useEffect, useState} from "react";
import {getUserDetails} from "../services/auth/userDetails";

export const AppContext = createContext();

const initialUserData = null;

export const AppContextProvider =({children}) => {

    const [userData, setUserData] = useState(initialUserData);


    useEffect(() => {
        const fetchUser = async () => {
            try{
                const response = await getUserDetails();
                setUserData(response.data.userData);
            }catch(error){
                console.warn("User Not Authenticated");
                setUserData(initialUserData);
            }
        };
        fetchUser();
    }, []);


    const contextValue = {
        userData, setUserData
    }

    return(
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}


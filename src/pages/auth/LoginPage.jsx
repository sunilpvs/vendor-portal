import {useContext, useState} from "react";

import loginUser from "../../services/auth/auth";
import {useNavigate} from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";

import { AppContext } from "../../context/AppContext";

import {toast} from "react-hot-toast";
import {getUserDetails} from "../../services/auth/userDetails";

function LoginPage() {

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const { setUserData } = useContext(AppContext);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const payload = {username, password};
            const response = await loginUser(payload);
            const userDetails = await getUserDetails();

            if(response.status === 200){
                setUserData(userDetails.data.userData);
                toast.success("Login Successfull");
                setTimeout(() => {
                    navigate('/'); // or wherever check.php is triggered
                }, 300);

            }
        }catch(error){
            if(error.response.status === 401){
                toast.error("Invalid Credentials");
            }else if(error.response.status === 403){
                toast.error("Password Expired. Please reset your password");
                navigate('/reset-password');
            }else {
                alert("Login Failed");
                console.error(error);
            }
        }
    };

    return(
        <LoginForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin = {handleLogin}

        />
    );
}
export default LoginPage;
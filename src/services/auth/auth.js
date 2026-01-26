
import axiosInstance from "../../utils/axiosInstance.js";
import axios from "axios";


const loginUser = async ({username, password}) => {
    const payload = {
        username: username,
        password: password
    }
    return await axiosInstance.post('auth/login.php?portal=vendor', payload);
};

export default loginUser;

const baseURL = process.env.REACT_APP_API_BASE_URL;


export const logoutUser = async () => {
    try {
        await axiosInstance.post('auth/logout.php');
    } catch (error) {
        console.error("Logout failed", error);
    } finally {
        window.location.href = '/login';
    }
};


export const checkAuth = async () => {
    try {
        const response = await axiosInstance.get("auth/check.php?portal=vendor");
        return true;
    } catch (err) {
        if (err.response?.status === 401) {
            // Try to refresh
            try {
                await axiosInstance.get("auth/refresh.php?portal=vendor");
                return true; // refreshed successfully!
            } catch (refreshErr) {
                console.error("Token refresh failed:", refreshErr);
                return false;
            }
        }
        return false;
    }
};


export const forgetPassword = async ({ email }) => {
    const payload = { email };
    return await axiosInstance.post('api/auth/forgot-pwd', payload);
}


export const resetPassword = async ({ payload }) => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        throw new Error("Reset token is missing");
    }
    return await axiosInstance.post(`api/auth/reset-pwd?token=${token}`, payload);
}
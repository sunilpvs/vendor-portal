import axios from "axios";
import { toast } from "react-hot-toast";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

const refreshAxios = axios.create({
    baseURL,
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (window.location.pathname === "/login") {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await refreshAxios.get("/auth/refresh.php?portal=vendor");

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error("Refresh failed:", refreshError);
                toast.error("Session expired. Please login again.");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

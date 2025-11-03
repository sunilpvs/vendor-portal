import axiosInstance from "../../utils/axiosInstance";


export const getUserDetails =  () => {
    return axiosInstance.get('api/user/me');
}
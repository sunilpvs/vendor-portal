import axiosInstance from "../../utils/axiosInstance";


export const getUserDetails =  () => {
    return axiosInstance.get('api/user/me');
}

// get user role from token - vms type
export const getUserRole = () => {
    return axiosInstance.get('api/user/role?type=all-roles');
}
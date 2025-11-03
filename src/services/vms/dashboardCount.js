// src/services/initiateVendor.js
import axiosInstance from "../../utils/axiosInstance";

export const getRfqsCount= () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=count`);
};

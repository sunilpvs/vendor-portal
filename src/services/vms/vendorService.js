// src/services/vms/vendorService.js
import axiosInstance from "../../utils/axiosInstance";

// Get All rfi List
export const getAllRfqList = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=all-rfqs`);
};

// Get vendor combo list (optional fields can be passed)
export const getPendingRfqList = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=pending-rfqs`);
};

// Get all vendors list
export const getAllVendorsList = (page, limit) => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=all-vendors&page=${page}&limit=${limit}`);
}


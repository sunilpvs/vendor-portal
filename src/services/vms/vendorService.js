// src/services/vms/vendorService.js
import axiosInstance from "../../utils/axiosInstance";

// Get All rfi List
export const getAllRfqs = () => {
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

// get vendor rfqs
export const getVendorRfqs = (vendor_code) => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=vendor-rfqs&vendor_code=${vendor_code}`);
}

// get vendor user rfqs
export const getVendorUserRfqs = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=vendor-user-rfqs`);
}

// get basic vendor info for logged in user
export const getVendorInfo = () => {
    return axiosInstance.get(`api/vms/rfq-reference?type=vendor-info`);
}

// get initiated rfqs for admin dump
export const getInitiatedRfqsForAdmin = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=initiated-rfqs-list&mode=admin`);
}

// approve rfq by admin 
export const approveRfqByAdmin = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/rfq-review?action=approve&mode=auto-approve&reference_id=${reference_id}`, payload);
}

// get paginated rfqs 
export const getPaginatedRfqs = (page, limit) => {
    return axiosInstance.get(`api/vms/vendor-initiate?page=${page}&limit=${limit}`);
}


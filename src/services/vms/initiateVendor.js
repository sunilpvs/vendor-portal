// src/services/initiateVendor.js
import axiosInstance from "../../utils/axiosInstance";

// Get paginated RFQs
export const getPaginatedRfqs = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/vms/vendor-initiate?page=${page}&limit=${limit}`);
};

// Get RFQ by ID
export const getRfqById = (id) => {
    return axiosInstance.get(`api/vms/vendor-initiate?id=${id}`);
};

// Get RFQ combo list (basic dropdown, optional use)
export const getRfqCombo = () => {
    return axiosInstance.get(`api/vms/vendor-initiate?type=combo`);
};

// Add a new RFQ
export const addRfq = (payload) => {
    return axiosInstance.post(`api/vms/vendor-initiate`, payload);
};

// Update an existing RFQ by ID
export const editRfq = (id, payload) => {
    return axiosInstance.put(`api/vms/vendor-initiate?id=${id}`, payload);
};

// Delete a RFQ by ID
export const deleteRfq = (id) => {
    return axiosInstance.delete(`api/vms/vendor-initiate?id=${id}`);
};

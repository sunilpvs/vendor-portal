// src/services/costCenterService.js
import axiosInstance from "../../utils/axiosInstance";

// Get paginated costCenters
export const getPaginatedCostCenters = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/costcenter?page=${page}&limit=${limit}`);
};

// Get costCenter by ID
export const getCostCenterById = (id) => {
    return axiosInstance.get(`api/admin/costCenters?id=${id}`);
};

// export const getcostCenterCombo = (fields = ['id', 'costCenter']) => {
//     const params = new URLSearchParams();
//     params.append("type", "combo");
//     params.append("fields", fields.join(","));
//
//     return axiosInstance.get(`api/admin/costCenters?${params}`);
// };


// Get costCenter combo list (optional fields can be passed)
export const getCostCenterCombo = (fields = ['id', 'costCenter']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/costcenter?type=combo&fields=${fieldParams}`);
};

// Add a new costCenter
export const addCostCenter = (payload) => {
    return axiosInstance.post('api/admin/costcenter', payload);
};

// Update an existing costCenter by ID
export const editCostCenter = (id, payload) => {
    return axiosInstance.put(`api/admin/costcenter?id=${id}`, payload);
};

// Delete a costCenter by ID
export const deleteCostCenter = (id) => {
    return axiosInstance.delete(`api/admin/costcenter?id=${id}`);
};

export const getPrimaryContacts = (id) => {
    return axiosInstance.get(`api/admin/entity?id=${id}`);
};
 
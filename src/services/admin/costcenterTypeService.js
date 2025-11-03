import axiosInstance from "../../utils/axiosInstance";

// Get paginated costcenter types
export const getPaginatedCostCenterType = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/costctype?page=${page}&limit=${limit}`);
};

// Get costcenter type by ID
export const getCostCenterTypeById = (id) => {
  return axiosInstance.get(`api/admin/costctype?id=${id}`);
};

// Get costcenter type combo list (for dropdowns)
export const getCostCenterTypeCombo = (fields = ['id', 'cc_type']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/admin/costctype?type=combo&fields=${fieldParams}`);
};

// Add a new costcenter type
export const addCostCenterType = (payload) => {
  return axiosInstance.post('api/admin/costctype', payload);
};

// Update an existing costcenter type by ID
export const editCostCenterType = (id, payload) => {
  return axiosInstance.put(`api/admin/costctype?id=${id}`, payload);
};

// Delete a costcenter type by ID
export const deleteCostCenterType = (id) => {
  return axiosInstance.delete(`api/admin/costctype?id=${id}`);
};
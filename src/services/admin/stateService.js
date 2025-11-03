import axiosInstance from "../../utils/axiosInstance";

export const getStateCombo = (fields = ['id', 'state']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/states?type=combo&fields=${fieldParams}`);
};

export const getPaginatedStates = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/states?page=${page}&limit=${limit}`);
};

// Get state by ID
export const getStateById = (id) => {
  return axiosInstance.get(`api/admin/states?id=${id}`);
};

// Get state combo list (optional fields can be passed)
export const getCityCombo = (fields = ['id', 'state']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/admin/states?type=combo&fields=${fieldParams}`);
};

// Add a new state
export const addState = (payload) => {
  return axiosInstance.post('api/admin/states', payload);
};

// Update an existing state by ID
export const editState = (id, payload) => {
  return axiosInstance.put(`api/admin/states?id=${id}`, payload);
};

// Delete a state by ID
export const deleteState = (id) => {
  return axiosInstance.delete(`api/admin/states?id=${id}`);
};
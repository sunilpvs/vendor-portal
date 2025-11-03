import axiosInstance from "../../utils/axiosInstance";

// Get paginated departments
export const getPaginatedDepartments = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/department?page=${page}&limit=${limit}`);
};

// Get department by ID
export const getDepartmentById = (id) => {
  return axiosInstance.get(`api/admin/department?id=${id}`);
};

// Add a new department
export const addDepartment = (payload) => {
  return axiosInstance.post("api/admin/department", payload);
};

// Update department
export const editDepartment = (id, payload) => {
  return axiosInstance.put(`api/admin/department?id=${id}`, payload);
};

// Delete department
export const deleteDepartment = (id) => {
  return axiosInstance.delete(`api/admin/department?id=${id}`);
};
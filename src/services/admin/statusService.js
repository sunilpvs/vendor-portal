import axiosInstance from "../../utils/axiosInstance";

export const getPaginatedStatuses = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/status?page=${page}&limit=${limit}`);
};

export const getStatusById = (id) => {
  return axiosInstance.get(`api/admin/status?id=${id}`);
};

export const getStatusCombo = (fields = ['id', 'status']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/admin/status?type=combo&fields=${fieldParams}`);
};

export const getStatusByModule = (fields = ['module']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/admin/status?module=${fieldParams}`);
};


export const addStatus = (payload) => {
  return axiosInstance.post("api/admin/status", payload);
};

export const editStatus = (id, payload) => {
  return axiosInstance.put(`api/admin/status?id=${id}`, payload);
};

export const deleteStatus = (id) => {
  return axiosInstance.delete(`api/admin/status?id=${id}`);
};
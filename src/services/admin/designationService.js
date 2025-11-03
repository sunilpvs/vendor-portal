import axiosInstance from "../../utils/axiosInstance";

export const getPaginatedDesignations = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/designation?page=${page}&limit=${limit}`);
};

export const getDesignationById = (id) => {
  return axiosInstance.get(`api/admin/designation?id=${id}`);
};

export const addDesignation = (payload) => {
  return axiosInstance.post("api/admin/designation", payload);
};

export const editDesignation = (id, payload) => {
  return axiosInstance.put(`api/admin/designation?id=${id}`, payload);
};

export const deleteDesignation = (id) => {
  return axiosInstance.delete(`api/admin/designation?id=${id}`);
};
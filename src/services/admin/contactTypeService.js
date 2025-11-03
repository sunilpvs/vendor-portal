import axiosInstance from "../../utils/axiosInstance";

// Get paginated contact types
export const getPaginatedContactTypes = (page = 1, limit = 10) => {
  return axiosInstance.get(`api/admin/contacttype?page=${page}&limit=${limit}`);
};

// Get contact type by ID
export const getContactTypeById = (id) => {
  return axiosInstance.get(`api/admin/contacttype?id=${id}`);
};

// Get contact type combo list (for dropdowns)
export const getContactTypeCombo = (fields = ['id', 'name']) => {
  const fieldParams = fields.join(',');
  return axiosInstance.get(`api/admin/contacttype?type=combo&fields=${fieldParams}`);
};

// Add a new contact type
export const addContactType = (payload) => {
  return axiosInstance.post('api/admin/contacttype', payload);
};

// Update an existing contact type by ID
export const editContactType = (id, payload) => {
  return axiosInstance.put(`api/admin/contacttype?id=${id}`, payload);
};

// Delete a contact type by ID
export const deleteContactType = (id) => {
  return axiosInstance.delete(`api/admin/contacttype?id=${id}`);
};
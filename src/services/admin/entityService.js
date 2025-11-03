// src/services/entityService.js
import axiosInstance from "../../utils/axiosInstance";

// Get paginated entity
export const getPaginatedEntities = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/entity?page=${page}&limit=${limit}`);
};

// Get entity by ID
export const getEntityById = (id) => {
    return axiosInstance.get(`api/admin/entity?id=${id}`);
};

// Get entity combo list (only if supported by backend)
export const getEntityCombo = (fields = ['id', 'entity_name']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/entity?type=combo&fields=${fieldParams}`);
};

// Get Primary Contact List
export const getPrimaryContacts = () => {

    return axiosInstance.get(`api/admin/entity?primary_contacts=1}`);
};


// Add a new entity
export const addEntity = (payload) => {
    return axiosInstance.post('api/admin/entity', payload);
};

// Update an existing entity by ID
export const editEntity = (id, payload) => {
    return axiosInstance.put(`api/admin/entity?id=${id}`, payload);
};

// Delete an entity by ID
export const deleteEntity = (id) => {
    return axiosInstance.delete(`api/admin/entity?id=${id}`);
};

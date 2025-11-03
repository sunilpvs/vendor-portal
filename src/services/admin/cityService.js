// src/services/cityService.js
import axiosInstance from "../../utils/axiosInstance";

// Get paginated cities
export const getPaginatedCities = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/cities?page=${page}&limit=${limit}`);
};

// Get city by ID
export const getCityById = (id) => {
    return axiosInstance.get(`api/admin/cities?id=${id}`);
};

// export const getCityCombo = (fields = ['id', 'city']) => {
//     const params = new URLSearchParams();
//     params.append("type", "combo");
//     params.append("fields", fields.join(","));
//
//     return axiosInstance.get(`api/admin/cities?${params}`);
// };


// Get city combo list (optional fields can be passed)
export const getCityCombo = (fields = ['id', 'city']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/cities?type=combo&fields=${fieldParams}`);
};

// Add a new city
export const addCity = (payload) => {
    return axiosInstance.post('api/admin/cities', payload);
};

// Update an existing city by ID
export const editCity = (id, payload) => {
    return axiosInstance.put(`api/admin/cities?id=${id}`, payload);
};

// Delete a city by ID
export const deleteCity = (id) => {
    return axiosInstance.delete(`api/admin/cities?id=${id}`);
};

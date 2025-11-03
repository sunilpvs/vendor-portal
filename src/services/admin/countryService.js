import axiosInstance from "../../utils/axiosInstance";

export const getCountryCombo = (fields = ['id', 'country']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/countries?type=combo&fields=${fieldParams}`);
};

// Get paginated cities
export const getPaginatedCountries = (page = 1, limit = 10) => {
    return axiosInstance.get(`api/admin/countries?page=${page}&limit=${limit}`);
};

// Get city by ID
export const getCountryById = (id) => {
    return axiosInstance.get(`api/admin/countries?id=${id}`);
};

// export const getCityCombo = (fields = ['id', 'city']) => {
//     const params = new URLSearchParams();
//     params.append("type", "combo");
//     params.append("fields", fields.join(","));
//
//     return axiosInstance.get(`api/admin/countries?${params}`);
// };


// Get city combo list (optional fields can be passed)
export const getCityCombo = (fields = ['id', 'city']) => {
    const fieldParams = fields.join(',');
    return axiosInstance.get(`api/admin/countries?type=combo&fields=${fieldParams}`);
};

// Add a new city
export const addCountry = (payload) => {
    return axiosInstance.post('api/admin/countries', payload);
};

// Update an existing city by ID
export const editCountry = (id, payload) => {
    return axiosInstance.put(`api/admin/countries?id=${id}`, payload);
};

// Delete a city by ID
export const deleteCountry = (id) => {
    return axiosInstance.delete(`api/admin/countries?id=${id}`);
};

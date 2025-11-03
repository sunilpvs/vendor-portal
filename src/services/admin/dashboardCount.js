// src/services/admin/dashboardCount.js
import axiosInstance from "../../utils/axiosInstance";

// Get total cities count
export const getCitiesCount = () => {
    return axiosInstance.get(`api/admin/cities?type=count`);
};

// Get total countries count
export const getCountriesCount = () => {
    return axiosInstance.get(`api/admin/countries?type=count`);
};

// Get total countries count
export const getStatesCount = () => {
    return axiosInstance.get(`api/admin/states?type=count`);
};

// Get total department count
export const getDepartmentsCount = () => {
    return axiosInstance.get(`api/admin/department?type=count`);
};

// Get total designation count
export const getDesignationsCount = () => {
    return axiosInstance.get(`api/admin/designation?type=count`);
};

// Get total entity count
export const getEntitiesCount = () => {
    return axiosInstance.get(`api/admin/entity?type=count`);
};
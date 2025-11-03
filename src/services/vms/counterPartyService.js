import axiosInstance from "../../utils/axiosInstance";

export const getCompanyInfo = (id) => {
    return axiosInstance.get(`api/vms/counterparty?reference_id=${id}`);
};

export const addCompanyInfo = (reference_id,payload) => {
    return axiosInstance.post(`api/vms/counterparty?reference_id=${reference_id}`, payload);
}


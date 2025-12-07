import axiosInstance from '../../utils/axiosInstance'

export const getBankDetails = (reference_id) => {
    return axiosInstance.get(`api/vms/bank-info?reference_id=${reference_id}`);
}

export const addBankDetails = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/bank-info?reference_id=${reference_id}`,payload );
}

export const updateBankDetails = (reference_id, payload) => {
    return axiosInstance.put(`api/vms/bank-info?reference_id=${reference_id}`, payload);
}
import axiosInstance from '../../utils/axiosInstance'

export const getBankDetails = (reference_id) => {
    return axiosInstance.get(`api/vms/bank?reference_id=${reference_id}`);
}

export const addBankDetails = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/bank?reference_id=${reference_id}&type=bank`,payload );
}

export const addComplianceDetails = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/bank?reference_id=${reference_id}&type=compliance`,payload );
}
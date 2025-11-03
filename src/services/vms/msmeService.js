import axiosInstance from '../../utils/axiosInstance'

export const getMsmeDetails = (id) => {
    return axiosInstance.get(`api/vms/msme?reference_id=${id}`);
}

export const addMsmeDetails = (id, payload) => {
    return axiosInstance.post(`api/vms/msme?reference_id=${id}`, payload);
}






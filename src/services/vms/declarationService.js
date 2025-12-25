import axiosInstance from "../../utils/axiosInstance";


export const getDeclarations = (reference_id) => {
    return axiosInstance.get(`api/vms/declarations?reference_id=${reference_id}`);
}

export const addDeclarations = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/declarations?reference_id=${reference_id}`, payload);
}

export const updateDeclarations = (reference_id, declaration_id, payload) => {
    return axiosInstance.post(`api/vms/declarations/?reference_id=${reference_id}&id=${declaration_id}`, payload);
}

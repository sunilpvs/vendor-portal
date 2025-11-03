import axiosInstance from "../../utils/axiosInstance";

export const getDocumentDetails = (reference_id) => {
    return axiosInstance.get(`api/vms/documents?reference_id=${reference_id}`);
}

export const addDocuments = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/documents?reference_id=${reference_id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}
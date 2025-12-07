import axiosInstance from '../../utils/axiosInstance'

export const getAllDetailsOfGst = (id) => {
    return axiosInstance.get(`api/vms/gst?vendor_id=${id}`);
}

export const getGstRegistrations = (id) => {
    return axiosInstance.get(`api/vms/gst?reference_id=${id}&type=gst_registrations`);
}

export const getGoodsAndServices = (id) => {
    return axiosInstance.get(`api/vms/gst?reference_id=${id}&type=goods_services`);
}

export const getIncomeTaxDetails = (id) => {
    return axiosInstance.get(`api/vms/gst?reference_id=${id}&type=income_tax_details`);
}

export const addGstRegistrations = (id, payload) => {
    return axiosInstance.post(`api/vms/gst?reference_id=${id}&type=gst_registrations`, payload);
}

export const updateGstRegistrations = (id, payload) => {
    return axiosInstance.put(`api/vms/gst?reference_id=${id}&type=gst_registrations`, payload);
}

export const addGoodsAndServices = (id, payload) => {
    return axiosInstance.post(`api/vms/gst?reference_id=${id}&type=goods_services`, payload);
}

export const updateGoodsAndServices = (id, payload) => {
    return axiosInstance.put(`api/vms/gst?reference_id=${id}&type=goods_services`, payload);
}

export const addIncomeTaxDetails = (id, payload) => {
    return axiosInstance.post(`api/vms/gst?reference_id=${id}&type=income_tax_details`, payload);
}

export const updateIncomeTaxDetails = (id, payload) => {
    return axiosInstance.put(`api/vms/gst?reference_id=${id}&type=income_tax_details`, payload);
}


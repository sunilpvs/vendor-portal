import axiosInstance from "../../utils/axiosInstance";

export const getDocumentDetails = (reference_id) => {
    return axiosInstance.get(`api/vms/documents?reference_id=${reference_id}`);
}

export const addDocuments = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/documents?reference_id=${reference_id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

export const updateDocuments = (reference_id, payload) => {
    return axiosInstance.post(`api/vms/documents?reference_id=${reference_id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}

/* 

    whether its post or put request, send all the documents in the request body.

    request body for documents for post request:
    
    form-data:
    doc_types[]: string
    files[]: file

    example:
    doc_types[]: "business_license"
    files[]: file
    doc_types[]: "tax_certificate"
    files[]: file


    requestbody for documents for put request

    1. If updating documents all files should be sent in the request body, three cases arise:
        a. include doc_id, doc_type and file for documents being updated.
        b. include only doc_id to delete documents.
        c. include only doc_type and file to add new documents.
    2. If adding new documents, include only doc_types and files without doc_ids.



    form-data:

    // for updating
    doc_ids[]: string
    doc_types[]: string
    files[]: file 

    // for deleting
    doc_ids[]: string
    
    // for adding new documents
    doc_types[]: string
    files[]: file


    example:
    doc_ids[]: 123
    doc_types[]: "business_license"
    files[]: file
    doc_ids[]: 124
    doc_types[]: "tax_certificate"
    files[]: file

*/
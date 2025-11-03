import React, { useState, useEffect } from "react";
import CostCenterTable from "./CostCenterTable";
import CostCenterForm from "./CostCenterForm";
import { getPaginatedCostCenters,addCostCenter,editCostCenter, deleteCostCenter } from "../../services/admin/costcenterService";
import toast from "react-hot-toast";

const CostCenter = () => {
    const [costCenters, setCostCenters] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCostCenter, setSelectedCostCenter] = useState(null);

    const fetchCostCenters = async (pageNum = page, limitPerPage = limit, search = searchTerm) => {
        try {
            const res = await getPaginatedCostCenters(pageNum, limitPerPage, search);
            console.log("API response:", res.data);

            setCostCenters(res.data.costCenters || []);
            setTotal(res.data.total || 0);
            setPage(res.data.page || pageNum);
            setLimit(res.data.limit || limitPerPage);
        } catch (err) {
            console.error("Failed to fetch cost centers", err);
        }
    };

    useEffect(() => {
        fetchCostCenters(page, limit, searchTerm);
    }, [page, limit, searchTerm]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this cost center?")) {
            try {
                await deleteCostCenter(id);
                toast.success("Deleted successfully");
                fetchCostCenters(page, limit, searchTerm);
            } catch (err) {
                toast.error("Failed to delete");
            }
        }
    };


    const handleSubmit = async (formData) => {
        try {
            let response;
            if (editMode) {
                response = await editCostCenter(formData.id, formData);
            }else {
                response = await addCostCenter(formData);
            }
            if(response?.data?.error){
                toast.error(response?.data?.error);
            }else{
                toast.success(response?.data?.message);
            }
            // Reset to page 1 after add/edit
            setPage(1);
            fetchCostCenters(1, limit, searchTerm);
            setOpenForm(false);
            setSelectedCostCenter(null);
            setEditMode(false);
        } catch (err) {
            if (err.response?.data?.error) {
                toast.error(err.response.data.error);
                console.error("API error:", err.response.data.error);
            } else {
                toast.error("An error occurred while saving country.");
                console.error("Submit failed", err);
            }
        }
    };

    const handleEdit = (CostCenter) => {
        setSelectedCostCenter(CostCenter);
        setEditMode(true);
        setOpenForm(true);
    };


    const handleAdd = () => {
        setSelectedCostCenter({ costcenter: "", cc_code:"", cc_type:"", entity_id:"", incorp_date:"", gst_no:"", add1:"", city:"", state:"", pin:"", country:"", primary_contact:"", status:""});
        setEditMode(false);
        setOpenForm(true);
    };

    const handlePageChange = (newPage) => {
        if (newPage !== page && newPage > 0 && newPage <= Math.ceil(total / limit)) {
            setPage(newPage);
        }
    };

    const handleLimitChange = (newLimit) => {
        if (newLimit !== limit) {
            setLimit(newLimit);
            setPage(1); // reset to first page on limit change
        }
    };

    const closeForm = () => {
        setOpenForm(false);
        setSelectedCostCenter(null);
        setEditMode(false);
    };

    const handleSearchChange = (newSearch) => {
        if (newSearch !== searchTerm) {
            setSearchTerm(newSearch);
            setPage(1); // reset to first page on search
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <button className="btn btn-primary float-end mt-4" onClick={handleAdd}>
                        + Add CostCenters
                    </button>
                    <CostCenterTable
                        costCenters={costCenters}
                        deleteCostCenter={handleDelete}
                        editCostCenter={(cc) => console.log("Edit", cc)}
                        currentPage={page}
                        total={total}
                        itemsPerPage={limit}
                        onPageChange={(p) => setPage(p)}
                        onLimitChange={(l) => setLimit(l)}
                        onSearch={setSearchTerm}
                        searchTerm={searchTerm}
                    />
                    {openForm && (
                        <CostCenterForm data={selectedCostCenter} add={handleSubmit} close={closeForm} editMode={editMode} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CostCenter;


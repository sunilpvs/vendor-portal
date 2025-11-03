import { useEffect, useState } from "react";
import DepartmentForm from "./DepartmentForm";
import Table from "./DepartmentTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-hot-toast';


import {
  getPaginatedDepartments,
  addDepartment,
  editDepartment,
  deleteDepartment,
} from "../../services/admin/departmentService";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  

  const fetchDepartments = async (pageNum = page, limitPerPage = limit, search = searchTerm) => {
    try {
      const res = await getPaginatedDepartments(pageNum, limitPerPage);
      setDepartments(res.data.departments || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
      setLimit(limitPerPage);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  // Fetch whenever page, limit or searchTerm changes
  useEffect(() => {
    fetchDepartments(page, limit);
  }, [page, limit]);

  const handleDelete = async (id) => {
    try {
      await deleteDepartment(id);
      // After deletion, refetch current page data:
      // If last item of last page is deleted, adjust page if needed
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / limit);
      const newPage = page > maxPage ? maxPage : page;
      setTotal(newTotal);
      setPage(newPage);
      fetchDepartments(newPage, limit, searchTerm);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editMode) {
        response = await editDepartment(formData.id, formData);
      }else {
        response = await addDepartment(formData);
      }
      if(response?.data?.error){
        toast.error(response?.data?.error);
      }else{
        toast.success(response?.data?.message);
      }
      // Reset to page 1 after add/edit
      setPage(1);
      fetchDepartments(1, limit, searchTerm);
      setOpenForm(false);
      setSelectedDepartment(null);
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

  const handleEdit = (Department) => {
    setSelectedDepartment(Department);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedDepartment({ Department: "", state: "", country: "" });
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
    setSelectedDepartment(null);
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
              + Add Department
            </button>

            <Table
                departments={departments}
                deleteDepartment={handleDelete}
                editDepartment={handleEdit}
                currentPage={page}
                total={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearchChange}
                searchTerm={searchTerm}
            />

            {openForm && (
                <DepartmentForm data={selectedDepartment} add={handleSubmit} close={closeForm} editMode={editMode} />
            )}
          </div>
        </div>
      </div>
  );
};

export default Department;

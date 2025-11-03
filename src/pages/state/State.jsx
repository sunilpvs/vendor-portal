import { useEffect, useState } from "react";
import StateForm from "./StateForm";
import Table from "./StateTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from 'react-hot-toast';

import {
  getPaginatedStates,
  addState,
  editState,
  deleteState,
} from "../../services/admin/stateService";

const State = () => {
  const [states, setStates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  const fetchStates = async (pageNum = page, limitPerPage = limit, search = searchTerm) => {
    try {
      const res = await getPaginatedStates(pageNum, limitPerPage);
      setStates(res.data.states || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
    } catch (err) {
      console.error("Failed to fetch states", err);
    }
  };

  useEffect(() => {
    fetchStates(page, limit);
  }, [page, limit]);

  const handleDelete = async (id) => {
    try {
      await deleteState(id);
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / limit);
      const newPage = page > maxPage ? maxPage : page;
      setTotal(newTotal);
      setPage(newPage);
      fetchStates(newPage, limit, searchTerm);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editMode) {
        response = await editState(formData.id, formData);
      } else {
        response = await addState(formData);
      }

      if (response?.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.success(response.data.message);
      }

      setPage(1);
      fetchStates(1, limit, searchTerm);
      setOpenForm(false);
      setSelectedState(null);
      setEditMode(false);
    } catch (err) {
      toast.error("An error occurred while saving state.");
      console.error("Submit failed", err);
    }
  };

  const handleEdit = (stateData) => {
    setSelectedState(stateData);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedState({ state: "", country: "" });
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
      setPage(1);
    }
  };

  const closeForm = () => {
    setOpenForm(false);
    setSelectedState(null);
    setEditMode(false);
  };

  const handleSearchChange = (newSearch) => {
    if (newSearch !== searchTerm) {
      setSearchTerm(newSearch);
      setPage(1);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <button className="btn btn-primary float-end mt-4" onClick={handleAdd}>
            + Add State
          </button>

          <Table
            states={states}
            deleteState={handleDelete}
            editState={handleEdit}
            currentPage={page}
            total={total}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onSearch={handleSearchChange}
            searchTerm={searchTerm}
          />

          {openForm && (
            <StateForm data={selectedState} add={handleSubmit} close={closeForm} editMode={editMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default State;
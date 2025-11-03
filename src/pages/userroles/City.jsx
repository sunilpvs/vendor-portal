import { useEffect, useState } from "react";
import Form from "./Form";
import Table from "./Table";

import "bootstrap/dist/css/bootstrap.min.css";

import {
  getPaginatedCities,
  addCity,
  editCity,
  deleteCity,
} from "../../services/admin/cityService";

const City = () => {
  const [cities, setCities] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const fetchCities = async (pageNum = page, limitPerPage = limit, search = searchTerm) => {
    try {
      const res = await getPaginatedCities(pageNum, limitPerPage, search);
      setCities(res.data.cities || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
      setLimit(limitPerPage);
    } catch (err) {
      console.error("Failed to fetch cities", err);
    }
  };

  // Fetch whenever page, limit or searchTerm changes
  useEffect(() => {
    fetchCities(page, limit, searchTerm);
  }, [page, limit, searchTerm]);

  const handleDelete = async (id) => {
    try {
      await deleteCity(id);
      // After deletion, refetch current page data:
      // If last item of last page is deleted, adjust page if needed
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / limit);
      const newPage = page > maxPage ? maxPage : page;
      setTotal(newTotal);
      setPage(newPage);
      fetchCities(newPage, limit, searchTerm);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editMode) {
        await editCity(formData.id, formData);
      } else {
        await addCity(formData);
      }
      // Reset to page 1 after add/edit
      setPage(1);
      fetchCities(1, limit, searchTerm);
      setOpenForm(false);
      setSelectedCity(null);
      setEditMode(false);
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  const handleEdit = (city) => {
    setSelectedCity(city);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedCity({ city: "", state: "", country: "" });
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
              + Add City
            </button>

            <Table
                cities={cities}
                deleteCity={handleDelete}
                editCity={handleEdit}
                currentPage={page}
                total={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearchChange}
                searchTerm={searchTerm}
            />

            {openForm && (
                <Form data={selectedCity} add={handleSubmit} close={() => setOpenForm(false)} />
            )}
          </div>
        </div>
      </div>
  );
};

export default City;

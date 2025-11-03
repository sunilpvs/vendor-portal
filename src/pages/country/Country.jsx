import { useEffect, useState } from "react";
import CountryForm from "./CountryForm";
import CountryTable from "./CountryTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

import {
  getPaginatedCountries,
  addCountry,
  editCountry,
  deleteCountry,
} from "../../services/admin/countryService";

const Country = () => {
  const [countries, setCountries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const fetchCountries = async (
      pageNum = page,
      limitPerPage = limit,
      search = searchTerm
  ) => {
    try {
      const res = await getPaginatedCountries(pageNum, limitPerPage, search);
      setCountries(res.data.countries || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
      setLimit(limitPerPage);
    } catch (err) {
      console.error("Failed to fetch countries", err);
    }
  };

  useEffect(() => {
    fetchCountries(page, limit, searchTerm);
  }, [page, limit, searchTerm]);

  const handleDelete = async (id) => {
    try {
      await deleteCountry(id);
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / limit);
      const newPage = page > maxPage ? maxPage : page;
      setTotal(newTotal);
      setPage(newPage);
      fetchCountries(newPage, limit, searchTerm);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete country.");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editMode) {
        response = await editCountry(formData.id, formData);
      } else {
        response = await addCountry(formData);
      }
      if (response?.data?.error) {
        toast.error(response.data.error);
        console.log(response.data.error);
      } else {
        toast.success(response.data.message);
      }
      setPage(1);
      fetchCountries(1, limit, searchTerm);
      setOpenForm(false);
      setSelectedCountry(null);
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

  const handleEdit = (country) => {
    setSelectedCountry(country);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedCountry({ country: "", code: "", currency: "" });
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
    setSelectedCountry(null);
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
              + Add Country
            </button>

            <CountryTable
                countries={countries}
                deleteCountry={handleDelete}
                editCountry={handleEdit}
                currentPage={page}
                total={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                onSearch={handleSearchChange}
                searchTerm={searchTerm}
            />

            {openForm && (
                <CountryForm data={selectedCountry} add={handleSubmit} close={closeForm} />
            )}
          </div>
        </div>
      </div>
  );
};

export default Country;

import { useEffect, useState } from "react";
import ContactTypeForm from "./ContactTypeForm";
import ContactTypeTable from "./ContactTypeTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";

import {
  getPaginatedContactTypes,
  addContactType,
  editContactType,
  deleteContactType,
} from "../../services/admin/contactTypeService";

const ContactType = () => {
  const [contactTypes, setContactTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedContactType, setSelectedContactType] = useState(null);

  const fetchContactTypes = async (pageNum = page, limitPerPage = limit) => {
    try {
      const res = await getPaginatedContactTypes(pageNum, limitPerPage);
      setContactTypes(res.data.contact_types || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || pageNum);
      setLimit(limitPerPage);
    } catch (err) {
      console.error("Failed to fetch contact types", err);
      toast.error("Failed to load contact types");
    }
  };

  useEffect(() => {
    fetchContactTypes(page, limit);
  }, [page, limit]);

  const handleDelete = async (id) => {
    try {
      await deleteContactType(id);
      const newTotal = total - 1;
      const maxPage = Math.ceil(newTotal / limit);
      const newPage = page > maxPage ? maxPage : page;
      setTotal(newTotal);
      setPage(newPage);
      fetchContactTypes(newPage, limit);
      toast.success("Contact Type deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete contact type");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      let response;
      if (editMode) {
        response = await editContactType(formData.id, formData);
      } else {
        response = await addContactType(formData);
      }
      if (response?.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.success(response.data.message || "Saved successfully");
      }
      setPage(1);
      fetchContactTypes(1, limit);
      setOpenForm(false);
      setSelectedContactType(null);
      setEditMode(false);
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("An error occurred while saving contact type.");
      }
      console.error("Submit failed", err);
    }
  };

  const handleEdit = (contactType) => {
    setSelectedContactType(contactType);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleAdd = () => {
    setSelectedContactType({ name: "", status: "active" });
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
    setSelectedContactType(null);
    setEditMode(false);
  };

  const handleSearchChange = (newSearch) => {
    if (newSearch !== searchTerm) {
      setSearchTerm(newSearch);
      setPage(1);
      // Optionally implement search filtering in fetch
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <button className="btn btn-primary float-end mt-4" onClick={handleAdd}>
            + Add Contact Type
          </button>

          <ContactTypeTable
            contactTypes={contactTypes}
            deleteContactType={handleDelete}
            editContactType={handleEdit}
            currentPage={page}
            total={total}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onSearch={handleSearchChange}
            searchTerm={searchTerm}
          />

          {openForm && (
            <ContactTypeForm
              data={selectedContactType}
              add={handleSubmit}
              close={closeForm}
              editMode={editMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactType;
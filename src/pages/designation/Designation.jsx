import { useEffect, useState } from "react";
import DesignationForm from "./DesignationForm";
import DesignationTable from "./DesignationTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-hot-toast";
import {
  getPaginatedDesignations,
  addDesignation,
  editDesignation,
  deleteDesignation,
} from "../../services/admin/designationService";

const Designation = () => {
  const [designations, setDesignations] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const fetchDesignations = async () => {
    try {
      const res = await getPaginatedDesignations(page, limit);
      setDesignations(res.data.designations || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch designations", err);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, [page, limit]);

  const handleDelete = async (id) => {
    try {
      await deleteDesignation(id);
      toast.success("Deleted successfully");
      fetchDesignations();
    } catch (err) {
      toast.error("Failed to delete");
      console.error(err);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const response = editMode
        ? await editDesignation(formData.id, formData)
        : await addDesignation(formData);

      if (response?.data?.error) {
        toast.error(response.data.error);
      } else {
        toast.success(response.data.message || "Saved successfully");
        fetchDesignations();
        setOpenForm(false);
        setSelectedDesignation(null);
        setEditMode(false);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  const handleAdd = () => {
    setSelectedDesignation({ designation: "", code: "", status: "active" });
    setEditMode(false);
    setOpenForm(true);
  };

  const handleEdit = (desig) => {
    setSelectedDesignation(desig);
    setEditMode(true);
    setOpenForm(true);
  };

  return (
    <div className="container mt-4">
     <div className="row justify-content-center">
        <div className="col-md-10">
            <button className="btn btn-primary float-end mt-4" onClick={handleAdd}>
              + Add Designation
            </button>
      <DesignationTable
        designations={designations}
        deleteDesignation={handleDelete}
        editDesignation={handleEdit}
        currentPage={page}
        total={total}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
      />
      {openForm && (
        <DesignationForm
          data={selectedDesignation}
          add={handleSubmit}
          close={() => {
            setOpenForm(false);
            setSelectedDesignation(null);
            setEditMode(false);
          }}
          editMode={editMode}
        />
      )}
    </div>
    </div>
    </div>
  );
};

export default Designation;
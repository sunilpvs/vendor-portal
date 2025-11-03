import { useState, useEffect } from "react";
import CostCenterTypeForm from "./CostCenterTypeForm";
import CostCenterTypeTable from "./CostCenterTypeTable";
import { toast } from 'react-hot-toast';

import {
  getPaginatedCostCenterType,
  addCostCenterType,
  editCostCenterType,
  deleteCostCenterType,
} from "../../services/admin/costcenterTypeService";

const CostCenterType = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    const res = await getPaginatedCostCenterType(page, limit);
    setData(res.data?.costcentertypes || []);
    setTotal(res.data?.total || 0);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const handleAdd = () => {
    setSelected({ cc_type: "" });
    setEditMode(false);
    setOpenForm(true);
  };

  const handleEdit = (item) => {
    setSelected(item);
    setEditMode(true);
    setOpenForm(true);
  };

  const handleDelete = async (id) => {
    await deleteCostCenterType(id);
    toast.success("Deleted");
    fetchData();
  };

  const handleSubmit = async (formData) => {
    let res;
    if (editMode) {
      res = await editCostCenterType(formData.id, formData);
    } else {
      res = await addCostCenterType(formData);
    }
    toast.success(res.data?.message || "Saved");
    fetchData();
    setOpenForm(false);
  };

  return (
    <div className="container mt-4">
          <div className="row justify-content-center">
          <div className="col-md-10">
            <button className="btn btn-primary float-end mt-4" onClick={handleAdd}>
              + Add Costcenter Type
            </button>

      <CostCenterTypeTable
        data={data}
        deleteItem={handleDelete}
        editItem={handleEdit}
        currentPage={page}
        itemsPerPage={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
      />

      {openForm && (
        <CostCenterTypeForm
          data={selected}
          add={handleSubmit}
          close={() => setOpenForm(false)}
          editMode={editMode}
        />
      )}
    </div>
    </div>
    </div>
  );
};

export default CostCenterType;
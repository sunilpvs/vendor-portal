import { useState, useEffect } from "react";
import { getStatusCombo } from "../../services/admin/statusService";

const DesignationForm = ({ data, add, close, editMode }) => {
  const [statusList, setStatusList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "",
    ...data,
  });

  useEffect(() => {
    setFormData({
      name: data?.name || "",
      code: data?.code || "",
      status: data?.status_id?.toString() || "",
      id: data?.id || undefined,
    });
    fetchStatuses();
  }, [data]);

  const fetchStatuses = async () => {
    try {
      const res = await getStatusCombo(["id", "status"]);
      setStatusList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch status list", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      code: formData.code,
      status: formData.status,
    };

    if (formData.id) {
      payload.id = formData.id;
    }

    add(payload);
  };

  return (
      <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Edit Designation" : "Add Designation"}
                </h5>
                <button type="button" className="btn-close" onClick={close}></button>
              </div>
              <div className="modal-body">
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Designation Name"
                    className="form-control mb-2"
                    required
                />
                <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Code"
                    className="form-control mb-2"
                    required
                />
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                >
                  <option value="">Select Status</option>
                  {statusList.map((s) => (
                      <option key={s.id} value={s.id.toString()}>
                        {s.status}
                      </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success">
                  Save
                </button>
                <button type="button" className="btn btn-secondary" onClick={close}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default DesignationForm;

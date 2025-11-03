import { useState, useEffect } from "react";
import {getStateCombo} from "../../services/admin/stateService";
import {getCountryCombo} from "../../services/admin/countryService";
import {getStatusCombo} from "../../services/admin/statusService";
const ContactTypeForm = ({ data, add, close, editMode }) => {

  const [status, setStatus] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    status: "",
    ...data,
  });

  useEffect(() => {
    setFormData({
      name: data?.name || "",
      status: data?.status_id?.toString() || "",
      id: data?.id || undefined,
    });
    fetchDropdowns();
  }, [data]);

  const fetchDropdowns = async () => {
    try {

      const statusData = await getStatusCombo(["id", "status"]);
      setStatus(statusData.data);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setFormData({ ...formData, status: value });
    }else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      status: formData.status,
    };

    // Include ID if editing
    if (formData.id) {
      payload.id = formData.id;
    }

    add(payload);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ marginLeft: "auto", marginRight: "30%" }}
      >
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">
                {editMode ? "Edit Contact Type" : "Add Contact Type"}
              </h5>
              <button type="button" className="btn-close" onClick={close}></button>
            </div>
            <div className="modal-body">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contact Type Name"
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
                {status.map((s) => (
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

export default ContactTypeForm;
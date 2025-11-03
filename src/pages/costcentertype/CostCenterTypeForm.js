import { useState, useEffect } from "react";

const CostCenterTypeForm = ({ data, add, close, editMode }) => {
  const [formData, setFormData] = useState({ cc_type: "" });

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, cc_type: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      cc_type: formData.cc_type,
    };
    if (data?.id) payload.id = data.id;
    add(payload);
  };

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ marginLeft: "auto", marginRight: "30%" }}>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{editMode ? 'Edit Cost Center Type' : 'Add Cost Center Type'}</h5>
              <button type="button" className="btn-close" onClick={close}></button>
            </div>
            <div className="modal-body">
              <input
                name="cc_type"
                value={formData.cc_type || ""}
                onChange={handleChange}
                placeholder="Cost Center Type"
                className="form-control mb-2"
                required
              />
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CostCenterTypeForm;
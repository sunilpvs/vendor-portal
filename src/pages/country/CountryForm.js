import { useState, useEffect } from "react";

const CountryForm = ({ data, add, close }) => {
  const [formData, setFormData] = useState({
    country: "",
    code: "",
    currency: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        country: data.country || "",
        code: data.code || "",
        currency: data.currency || "",
        id: data.id || null,
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const shouldUppercase = name === "code" || name === "currency";

    setFormData((prev) => ({
      ...prev,
      [name]: shouldUppercase ? value.toUpperCase() : value,
    }));

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      country: formData.country,
      code: formData.code,
      currency: formData.currency,
    };
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
                <h5 className="modal-title">Country Form</h5>
                <button type="button" className="btn-close" onClick={close}></button>
              </div>
              <div className="modal-body">
                <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="form-control mb-2"
                    required
                />
                <input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Code"
                    className="form-control mb-2"
                    maxLength={3}
                    required
                />
                <input
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    placeholder="Currency"
                    className="form-control mb-2"
                    maxLength={4}
                    required
                />
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

export default CountryForm;

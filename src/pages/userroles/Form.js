import { useState, useEffect } from "react";
// import { getCityCombo } from "../../services/admin/cityService";
import { getCountryCombo } from "../../services/admin/countryService";
import { getStateCombo } from "../../services/admin/stateService";

const Form = ({ data, add, close }) => {
  const [formData, setFormData] = useState(data);
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    setFormData(data);
    fetchDropdowns();
  }, [data]);

  const fetchDropdowns = async () => {
    try{
      const stateData = await getStateCombo(["id", "state"]);
      const countryData = await getCountryCombo(["id", "country"]);
      setStates(stateData.data);
      setCountries(countryData.data);
    } catch (err) {
      console.error("Failed to fetch dropdowns:", err);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({...formData, state_id: value });
    } else if (name === 'country') {
      setFormData({...formData, country_id: value });
    } else {
      setFormData({...formData, [name]: value});
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      city: formData.city,
      state: formData.state_id || formData.state, // prefer state_id
      country: formData.country_id || formData.country, // prefer country_id
    };

    // include ID if editing
    if (formData.id) {
      payload.id = formData.id;
    }

    add(payload);
  };


  return (
      <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered" style={{ marginLeft: "auto", marginRight: "30%" }}>
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">City Form</h5>
                <button type="button" className="btn-close" onClick={close}></button>
              </div>
              <div className="modal-body">
                {console.log("Current formData:", formData)}
                <input
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder="City"
                    className="form-control mb-2"
                    required
                />
                <select

                    name="state"
                    value={formData.state_id || ""}
                    onChange={handleChange}

                    className="form-control mb-2"
                    required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                      <option key={state.id} value={state.id.toString()}>
                        {state.state}
                      </option>
                  ))}

                </select>

                <select
                    name="country"
                    value={formData.country_id || ""}
                    onChange={handleChange}
                    className="form-control mb-2"
                    required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                      <option key={country.id} value={country.id.toString()}>
                        {country.country}
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
}

export default Form;

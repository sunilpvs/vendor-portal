import { useState, useEffect } from "react";
import { getPaginatedEntities } from "../../services/admin/entityService";
import { getCityCombo } from "../../services/admin/cityService";
import { getCountryCombo } from "../../services/admin/countryService";
import { getStateCombo } from "../../services/admin/stateService";
import { getPrimaryContacts } from "../../services/admin/entityService"; // new service
import { getStatusCombo } from "../../services/admin/statusService";


const CostCenterForm = ({ data, add, close }) => {
    const [formData, setFormData] = useState(data);
    const [entities, setEntities] = useState([]);
    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);
    const [countries, setCountries] = useState([]);
    const [primarycontacts, setPrimaryContacts] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        setFormData(data);
        fetchDropdowns();
    }, [data]);

    const fetchDropdowns = async () => {
        try {
            const entityData = await getPaginatedEntities();
            const cityData = await getCityCombo();
            const stateData = await getStateCombo(["id", "state"]);
            const countryData = await getCountryCombo();
            const primaryContactData = await getPrimaryContacts();
            const statusData = await getStatusCombo();

            setEntities(entityData.data);
            setCities(cityData.data);
            setStates(stateData.data);
            setCountries(countryData.data);
            setPrimaryContacts(primaryContactData.data);
            setStatusOptions(statusData.data);
        } catch (err) {
            console.error("Failed to fetch dropdowns:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "entity") {
            setFormData({ ...formData, entity_id: value });
        } else if (name === "city") {
            setFormData({ ...formData, city_id: value });
        } else if (name === "state") {
            setFormData({ ...formData, state_id: value });
        } else if (name === "country") {
            setFormData({ ...formData, country_id: value });
        } else if (name === "primary_contact") {
            setFormData({ ...formData, primary_contact_id: value });
        } else if (name === "status") {
            setFormData({ ...formData, status_id: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            cc_code: formData.cc_code,
            incorp_date: formData.incorp_date,
            gst_no: formData.gst_no,
            add1: formData.add1,
            add2: formData.add2,
            pin: formData.pin,
            entity_id: formData.entity_id || formData.entity,
            city: formData.city_id || formData.city,
            state: formData.state_id || formData.state,
            country: formData.country_id || formData.country,
            primary_contact: formData.primary_contact_id || formData.primary_contact,
            status: formData.status_id || formData.status,
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
                            <h5 className="modal-title">Costcenter Form</h5>
                            <button type="button" className="btn-close" onClick={close}></button>
                        </div>
                        <div className="modal-body">

                            {console.log(states?.data)}
                            <input
                                name="cc_code"
                                value={formData.cc_code || ""}
                                onChange={handleChange}
                                placeholder="CostCenter Code(HQ)"
                                className="form-control mb-2"
                                required
                            />

                            <select
                                name="entity_id"
                                value={formData.entity_id || ""}
                                onChange={handleChange}
                                className="form-control mb-2"
                                required
                            >
                                <option value="">Select Entity</option>
                                {entities.map((entity) => (
                                    <option key={entity.id} value={entity.id}>
                                        {entity.entity}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                name="incorp_date"
                                value={formData.incorp_date || ""}
                                onChange={handleChange}
                                placeholder="Incorporation Date"
                                className="form-control mb-2"
                                required
                            />

                            <input
                                name="gst_no"
                                value={formData.gst_no || ""}
                                onChange={handleChange}
                                placeholder="GST Number"
                                className="form-control mb-2"
                                required
                            />

                            <input
                                name="add1"
                                value={formData.add1 || ""}
                                onChange={handleChange}
                                placeholder="Address 1"
                                className="form-control mb-2"
                                required
                            />

                            <input
                                name="add2"
                                value={formData.add2 || ""}
                                onChange={handleChange}
                                placeholder="Address 2"
                                className="form-control mb-2"
                            />

                            <select
                                name="city"
                                value={formData.city_id || ""}
                                onChange={handleChange}
                                className="form-control mb-2"
                                required
                            >
                                <option value="">Select City</option>
                                {cities?.map((city) => (
                                    <option key={city?.id} value={city?.id.toString()}>
                                        {city?.city}
                                    </option>
                                ))}
                            </select>


                            {/* STATE */}
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

                            {/* PINCODE */}
                            <input
                                name="pin"
                                value={formData.pin || ""}
                                onChange={handleChange}
                                placeholder="Pin Code"
                                className="form-control mb-2"
                                required
                            />

                            {/* PRIMARY CONTACT */}
                            <select
                                name="primary_contact"
                                value={formData.primary_contact_id || ""}
                                onChange={handleChange}
                                className="form-control mb-2"
                                required
                            >
                                <option value="">Select Primary Contact</option>
                                {primarycontacts.map((pc) => (
                                    <option key={pc.id} value={pc.id}>
                                        {pc.contact}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="form-control mb-2"
                                required
                            >
                                <option value="">Select Status</option>
                                {statusOptions.map((s) => (
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
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={close}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CostCenterForm;
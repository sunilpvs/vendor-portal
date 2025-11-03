// src/pages/admin/VendorForm.js
import { useState, useEffect } from "react";
import { getEntityCombo } from "../../services/admin/entityService"; // replace with your actual entity API

import {getStatusByModule} from "../../services/admin/statusService";

const VendorForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        vendor_name: "",
        contact_name: "",
        email: "",
        mobile: "",
        entity_id: "",
        city_id: "",
        status: "active",
        expiry_date: "",
    });

    const [entities, setEntities] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const entityRes = await getEntityCombo(["id", "entity_name"]);
            const statusRes = await getStatusByModule([ "VMS"]);
            setEntities(entityRes.data?.entities || []);
            setStatuses(statusRes.data || []);
        } catch (err) {
            console.error("Failed to fetch dropdowns", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            <div className="mb-3">
                <label className="form-label">Vendor Name</label>
                <input
                    name="vendor_name"
                    className="form-control"
                    value={formData.vendor_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Contact Name</label>
                <input
                    name="contact_name"
                    className="form-control"
                    value={formData.contact_name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                    name="email"
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Mobile</label>
                <input
                    name="mobile"
                    className="form-control"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="mb-3">
                <label className="form-label">Entity</label>
                <select
                    name="entity_id"
                    className="form-control"
                    value={formData.entity_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Entity</option>
                    {entities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                            {entity?.entity_name}
                        </option>
                    ))}
                </select>
            </div>


            <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Status</option>
                    {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                            {status?.status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                    name="expiry_date"
                    type="date"
                    className="form-control"
                    value={formData.expiry_date}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="text-end">
                <button type="submit" className="btn btn-primary">
                    Submit Vendor
                </button>
            </div>
        </form>
    );
};

export default VendorForm;

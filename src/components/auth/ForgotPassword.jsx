import React, { useState, useEffect } from "react";
import { forgetPassword } from "../../services/auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getEntityCombo } from "../../services/admin/entityService";

const ForgotPassword = () => {

  
    const [email, setEmail] = useState("");
    const [entity, setEntity] = useState("");
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEntities = async () => {
            try {
                const response = await getEntityCombo(['id', 'entity_name']);
                if (response.data && response.data.entities) {
                    setEntities(response.data.entities);
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntities();
    }, []);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        // Handle forgot password logic 
        setProcessing(true);
        try {
            await forgetPassword({ email, entity_id: entity });
            toast.success("Reset link sent to your email.");
            navigate('/login');
        } catch (error) {
            console.error("Failed to send reset link:", error);
            toast.error(error.response?.data?.error || "Failed to send reset link.");
        } finally {
            setProcessing(false);
        }
    };


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="text-center mb-4">Forgot Password</h3>

                <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                        <label htmlFor="entity" className="form-label">Entity</label>
                        <select
                            name="entity"
                            id="entity"
                            value={entity}
                            onChange={(e) => setEntity(e.target.value)}
                            required
                            className="form-select"
                            disabled={loading}
                        >
                            <option value="">Select Entity</option>
                            {entities.map((ent) => (
                                <option key={ent.id} value={ent.id}>
                                    {ent.entity_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            placeholder="Enter registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!entity || !email || processing}
                        className="btn btn-primary w-100"
                    >
                        {processing ? "Processing..." : "Send Reset Link"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-100 mt-2"
                        onClick={() => navigate('/login')}
                        disabled={processing}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

import React, { useState } from "react";
import { forgetPassword } from "../../services/auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {

  
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        // Handle forgot password logic 
        try {
            await forgetPassword({ email });
            toast.success("Reset link sent to your email.");
            navigate('/login');
        } catch (error) {
            console.error("Failed to send reset link:", error);
            toast.error(error.response?.data?.error || "Failed to send reset link.");
        }
    };


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="text-center mb-4">Forgot Password</h3>

                <form onSubmit={handleForgotPassword}>
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
                        disabled={!email}
                        className="btn btn-primary w-100"
                    >
                        Send Reset Link
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary w-100 mt-2"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

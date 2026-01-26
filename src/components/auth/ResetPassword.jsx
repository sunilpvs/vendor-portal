import React, { useState } from "react";
import { resetPassword } from "../../services/auth/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ResetPassword = () => {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {    
        e.preventDefault();
        // Handle reset password logic
        try {
            const payload = { new_password: password };

            await resetPassword({ payload });
            toast.success("Password has been reset successfully. Please login.");
            navigate('/login');
        } catch (error) {
            console.error("Failed to reset password:", error);
            toast.error(error.response?.data?.error || "Failed to reset password.");
        }
    }


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="text-center mb-4">Reset Password</h3>

                <form onSubmit={handleResetPassword}>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="form-control"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!password || password !== confirmPassword}
                        className="btn btn-primary w-100"
                    >
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

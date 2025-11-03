import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import resetPassword from "../../services/auth/resetPasword"; // ✅ you must create API

function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    // ✅ Password regex
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleReset = async (e) => {
        e.preventDefault();

        if (!passwordRegex.test(newPassword)) {
            toast.error(
                "Password must be at least 8 characters, include uppercase, lowercase, number & special character."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await resetPassword({ newPassword });

            if (response.status === 200) {
                toast.success("Password reset successfully. Please login again.");
                navigate("/login");
            } else {
                toast.error("Password reset failed. Try again.");
            }
        } catch (error) {
            toast.error("Something went wrong.");
            console.error(error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form
                onSubmit={handleReset}
                className="bg-white shadow-md rounded p-6 w-96"
            >
                <h2 className="text-xl font-bold mb-4">Reset Password</h2>

                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 mb-3 rounded"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 mb-3 rounded"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
}

export default ResetPasswordPage;


const ResetPassword = ({
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleResetPassword
}) => {
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

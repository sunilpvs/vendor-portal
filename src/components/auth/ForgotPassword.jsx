const ForgotPassword = ({ email, setEmail, handleForgotPassword }) => {
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
                <h3 className="text-center mb-4">Forgot Password</h3>

                <form onSubmit={handleForgotPassword}>
                    <div className="mb-3">
                        <label className="form-label">Email / Username</label>
                        <input
                            type="text"
                            placeholder="Enter registered email or username"
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
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

import { useNavigate } from "react-router-dom";

const LoginForm = ({username, setUsername, password, setPassword, handleLogin}) => {
    const navigate = useNavigate();
    const authURL = process.env.REACT_APP_API_BASE_URL + "/auth/auth.php";
    
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{width: "100%", maxWidth: "400px"}}>
                <h3 className="text-center mb-4">Login Form</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email"  className="form-label">Username</label>
                        <input type="text"
                               name="username"
                               id="username"
                               placeholder="Enter Username"
                               value={username}
                               onChange={(e) => setUsername(e.target.value)}
                               required
                               className="form-control"/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-input">Password</label>
                        <input type="password"
                               name="password"
                               id="password"
                               placeholder='Enter Password'
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               required
                               className="form-control"/>
                    </div>
                    <div className="mb-2 text-end">
                        <button 
                            type="button"
                            onClick={() => navigate('/forgot-password')}
                            className="btn btn-link p-0"
                            style={{fontSize: "0.875rem"}}>
                            Forgot Password?
                        </button>
                    </div>
                    <button type="submit"
                        disabled={!username || !password}
                        className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm;
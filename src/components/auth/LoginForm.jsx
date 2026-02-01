import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getEntityCombo } from "../../services/admin/entityService";

const LoginForm = ({username, setUsername, password, setPassword, handleLogin, entity, setEntity}) => {
    const navigate = useNavigate();
    const authURL = process.env.REACT_APP_API_BASE_URL + "/auth/auth.php";    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);

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
    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card p-4 shadow" style={{width: "100%", maxWidth: "400px"}}>
                <h3 className="text-center mb-4">Login Form</h3>
                <form onSubmit={handleLogin}>
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
                        disabled={!entity || !username || !password}
                        className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm;
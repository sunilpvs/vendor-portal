import {AppContext} from '../../context/AppContext'
import { Box } from "@mui/material";
import Header from "../../components/Header";
import {useContext} from "react";

const UserProfile = () => {

   const{ userData } =  useContext(AppContext);

    if (!userData) {
        return (
            <Box m="50px" p={3}>
                <Header title="User Profile" subtitle="View employee profile information" />
                <div>Loading user profile...</div>
            </Box>
        );
    }

    return (

        <Box m="50px" p={3}>
            <Header title="User Profile" subtitle="View employee profile information" />
            <div className="container mt-4 p-3 bg-white rounded shadow-sm">

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">User Name</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.user_name} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">User Role</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.user_role} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Status</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.status} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">First Name</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.f_name} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Last Name</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.l_name} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Date of Birth</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.dob} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Email</label>
                        <input type="email" className="form-control demoInputBox" value={userData?.email} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Personal Email</label>
                        <input type="email" className="form-control demoInputBox" value={userData?.personal_email} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Mobile</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.mobile} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Address 1</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.address1} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Address 2</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.address2} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">City</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.city} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">State</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.state} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Country</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.country} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Date of Joining</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.joining_date} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Exit Date</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.exit_date} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Department</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.department} readOnly />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold text-muted">Designation</label>
                        <input type="text" className="form-control demoInputBox" value={userData?.designation} readOnly />
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default UserProfile;
 
 
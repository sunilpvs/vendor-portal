import React, { useState, useEffect } from "react";
import { getReferenceId ,getRfqStatus } from "../../services/vms/referenceIdService";
import { ref } from "yup";

const StatusPage = () => {
  const [status, setStatus] = useState(null);
  const [referenceId, setReferenceId] = useState(null);
  const [resubmitted, setResubmitted] = useState(false);

  useEffect(() => {
    const fetchReferenceId = async () => {
      try {
        const response = await getReferenceId();
        setReferenceId(response.data.reference_id);
      } catch (error) {
        console.error("Failed to fetch reference ID:", error);
      }
    };
    fetchReferenceId();
  }, []);


  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getRfqStatus(referenceId);
        setStatus(response.data.status);
        setResubmitted(response.data.resubmitted || false);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };
    fetchStatus();
  }, [referenceId]);


  const getStatusInfo = (status) => {
    switch (Number(status)) {
      case 7:
        return { title: "Initiated", message: "You are required to fill the form with the required details.", color: "#007bff" };
      case 8:
        return { title: "Submitted", message: "Your form has been submitted and is awaiting review.", color: "#17a2b8" };
      case 9:
        return { title: "Under Verification", message: "Your form is under verification. Please wait for admin approval.", color: "#ffc107" };
      case 10:
        return { title: "Sent Back", message: "Your form has been sent back for revisions. Please address the feedback and resubmit.", color: "#c1ad2eff" };
      case 11:
        return { title: "Approved", message: "Your form has been approved successfully!. Thank you for your submission.", color: "#28a745" };
      case 12:
        return { title: "Rejected", message: "Your form has been rejected. Please contact support for more information.", color: "#eb5d64ff" };
      case 13:
        return { title: "Blocked", message: "Your form has been blocked. Please contact support for more information.", color: "#ff152dff" };
      case 14:
        return { title: "Suspended", message: "The form submission period has expired.", color: "#343a40" };
      default:
        return { title: "Unknown", message: "No status available for this user.", color: "#999" };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "150px auto",
        padding: "25px",
        backgroundColor: "white",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        border: `2px solid ${statusInfo.color}`,
      }}
    >
      {status === null ? (
        <p style={{ color: "#666", fontSize: "16px" }}>Loading status...</p>
      ) : (
        <>
          <h2
            style={{
              color: statusInfo.color,
              marginBottom: "10px",
              fontSize: "22px",
            }}
          >
            {statusInfo.title}
          </h2>
          <p style={{ color: "#444", fontSize: "15px", margin: 0 }}>
            {statusInfo.message}
          </p>
        </>
      )}
    </div>
  );
};

export default StatusPage;

import { Box } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function MyRfi() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [rfis, setRfis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* ---------------- MOCK DATA (REPLACE WITH API) ---------------- */
  useEffect(() => {
    setRfis([
      
      {
        id: 1,
        rfi_id: "RFI-001",
        date: "20-12-2025",
        vendor_name: "XYZ Solutions",
        rfi_type: "Renewal",
        validity: "31-12-2028",
        status: "Approved",
      },
      {
        id: 2,
        rfi_id: "RFI-002",
        date: "18-12-2025",
        vendor_name: "LMN Corp",
        rfi_type: "Renewal",
        validity: "31-12-2027",
        status: "Sent Back",
      },
    ]);
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredRfis = rfis.filter((rfi) =>
    `${rfi.rfi_id} ${rfi.vendor_name} ${rfi.rfi_type} ${rfi.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredRfis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRfis = filteredRfis.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  /* ---------------- EDIT RULE ---------------- */
  const isEditableStatus = (status) => {
    return ["Initiated", "Renewal Initiated", "Sent Back"].includes(status);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Box m="20px">
      {/* PAGE HEADER */}
      <Header title="My RFI" subtitle="Vendor / My RFIs" />

      {/* WHITE CARD (SAME AS RFQ PAGE) */}
      <div className="container mt-4 p-3 bg-white rounded shadow-sm">

        {/* SEARCH & LIMIT */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
          <div className="me-3 mb-2" style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Search..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="d-flex align-items-center mb-2">
            <label className="form-label me-2 mb-0 text-body">
              Items per page:
            </label>
            <select
              className="form-select"
              style={{ width: "200px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>RFI ID</th>
                <th>Date</th>
                <th>Vendor Name</th>
                <th>RFI Type</th>
                <th>RFI Validity</th>
                <th>RFI Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedRfis.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-muted">
                    No RFIs found
                  </td>
                </tr>
              ) : (
                paginatedRfis.map((rfi) => (
                  <tr key={rfi.id}>
                    <td>{rfi.rfi_id}</td>
                    <td>{rfi.date}</td>
                    <td>{rfi.vendor_name}</td>
                    <td>{rfi.rfi_type}</td>
                    <td>{rfi.validity}</td>
                    <td>{rfi.status}</td>
                    <td>
                      {/* VIEW DETAILS – ALWAYS */}
<button
  className="btn btn-sm btn-primary me-2"
  onClick={() =>
    navigate(`/request-vendor?refId=${rfi.rfi_id}&mode=view`)
  }
>
  View Details
</button>

{/* EDIT – ONLY IF NOT APPROVED */}
{["Initiated", "Renewal Initiated", "Sent Back"].includes(rfi.status) && (
  <button
    className="btn btn-sm btn-danger"
    onClick={() =>
      navigate(`/request-vendor?refId=${rfi.rfi_id}&mode=edit`)
    }
  >
    Edit
  </button>
)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="form-label mb-0 text-body">
            Showing {paginatedRfis.length} of {filteredRfis.length} RFIs
          </span>

          <div>
            <button
              className="btn btn-outline-secondary btn-sm me-1"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`btn btn-sm me-1 ${
                  currentPage === index + 1
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="btn btn-outline-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
}

export default MyRfi;

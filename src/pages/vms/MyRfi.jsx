import { Box } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getReferenceId } from "../../services/vms/referenceIdService";
import { getVendorUserRfqs } from "../../services/vms/vendorService";

function MyRfi() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [rfis, setRfis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // const [caseType, setCaseType] = useState(null); // 'first_rfq' or 'multiple_rfis'
  const [referenceData, setReferenceData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH REFERENCE DATA ON MOUNT ---------------- */
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoading(true);
        const response = await getReferenceId();
        const data = response?.data;

        if (!data) {
          setLoading(false);
          return;
        }

        setReferenceData(data);

        // 
        if (
          (Array.isArray(data.reference_ids) && data.reference_ids.length > 0)  || data.reference_id
        ) {
          const rfiResponse = await getVendorUserRfqs();
          const rfiList = rfiResponse?.data?.rfqs || [];
          setRfis(rfiList);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reference data:", error);
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);
  
  /* Filter Results */
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


  // RENDER 
  return (
    <Box m="20px">
      {/* PAGE HEADER */}
      <Header title="My RFI" subtitle="Vendor / My RFIs" />

      {/* LOADING STATE */}
      {loading && (
        <div className="container mt-4 p-3 bg-white rounded shadow-sm text-center">
          <p className="text-muted">Loading RFI data...</p>
        </div>
      )}

      {/* NO DATA STATE */}
      {!loading && rfis.length === 0 && (
        <div className="container mt-4 p-3 bg-white rounded shadow-sm text-center">
          <p className="text-muted">No RFIs found.</p>
        </div>
      )}
      
      {/* DATA TABLE */}
      {!loading && (
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
                  <th>Vendor Name</th>
                  <th>Entity Name</th>
                  <th>Expiry Date</th>
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
                      <td>{rfi.reference_id}</td>
                      <td>{rfi.vendor_name}</td>
                      <td>{rfi.entity_name}</td>
                      <td>{rfi.expiry_date ? new Date(rfi.expiry_date).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td>{rfi.status}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            navigate(`/request-vendor/refId=${rfi.reference_id}`)
                          }
                        >
                          {rfi.status_id === 7 || rfi.status_id === 10 ? "Fill RFI" : "View Details"}
                        </button>
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
      )}
    </Box>
  );
}

export default MyRfi;

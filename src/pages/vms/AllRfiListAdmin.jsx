// This component displays a list of RFIs for the admin user, with search, filter, and pagination features.
// only for admin users to view all RFIs across vendors. Regular vendors should use MyRfi.jsx to see only their RFIs.

import { Box } from "@mui/material";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPaginatedRfqs } from "../../services/vms/vendorService";

function AllRfiListAdmin() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [rfis, setRfis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  /* ---------------- FETCH RFIs ---------------- */
  useEffect(() => {
    const fetchRfis = async () => {
      try {
        setLoading(true);
        const res = await getPaginatedRfqs(currentPage, itemsPerPage);
        setRfis(res?.data?.rfqs || []);
        setTotalCount(res?.data?.total || 0);
      } catch (err) {
        console.error("Failed to load RFIs", err);
        setRfis([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRfis();
  }, [currentPage, itemsPerPage]);

  /* ---------------- ENTITY OPTIONS ---------------- */
  const entityOptions = [
    ...new Set(
      rfis.map((rfi) => rfi.entity).filter(Boolean)
    ),
  ];

  /* ---------------- FILTER (SEARCH + ENTITY) ---------------- */
  const filteredRfis = rfis.filter((rfi) => {
    const searchText = `
      ${rfi.reference_id || ""}
      ${rfi.vendor_name || ""}
      ${rfi.entity || ""}
      ${rfi.status_name || ""}
      ${rfi.status || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(
      searchTerm.toLowerCase()
    );

    const matchesEntity =
      selectedEntity === "" ||
      rfi.entity === selectedEntity;

    return matchesSearch && matchesEntity;
  });

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  /* ---------------- RENDER ---------------- */
  return (
    <Box m="20px">
      <Header title="My RFI" subtitle="Vendor / My RFIs" />

      {/* LOADING */}
      {loading && (
        <div className="container mt-4 p-3 bg-white rounded shadow-sm text-center">
          Loading RFIs...
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="container mt-4 p-3 bg-white rounded shadow-sm">

          {/* SEARCH + ENTITY FILTER + LIMIT */}
          <div className="d-flex align-items-center flex-wrap mb-3">
            <input
              className="form-control me-2"
              style={{ maxWidth: "280px" }}
              placeholder="Search RFI / Vendor / Status"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              className="form-select me-2"
              style={{ width: "220px" }}
              value={selectedEntity}
              onChange={(e) => {
                setSelectedEntity(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Entities</option>
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>

            

            <select
              className="form-select"
              style={{ width: "150px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th>RFI ID</th>
                  <th>Vendor Code</th>
                  <th>Vendor Name</th>
                  <th>Entity Name</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRfis.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-muted">
                      No RFIs found
                    </td>
                  </tr>
                ) : (
                  filteredRfis.map((rfi) => (
                    <tr key={rfi.reference_id}>
                      <td>{rfi.reference_id}</td>
                      <td>{rfi.vendor_code ? rfi.vendor_code : "N/A"}</td>
                      <td>{rfi.vendor_name}</td>
                      <td>{rfi.entity}</td>
                      <td>
                        {rfi.expiry_date
                          ? new Date(rfi.expiry_date).toLocaleDateString(
                              "en-GB"
                            )
                          : "N/A"}
                      </td>
                      <td>{rfi.status_name || rfi.status}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            navigate(
                              `/dump-vendor-admin?refId=${rfi.reference_id}`
                            )
                          }
                        >
                          {rfi.status === 7 || rfi.status === 10
                            ? "Fill RFI"
                            : "View Details"}
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
            <span className="text-muted">
              Showing {filteredRfis.length} of {totalCount}
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
                disabled={currentPage >= totalPages}
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

export default AllRfiListAdmin;

import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import {useNavigate} from "react-router-dom";
import data from "bootstrap/js/src/dom/data";

function RfqTable({
  Rfqs,
  deleteRfq,
  editRfq,
  currentPage,
  total,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  onSearch,
  searchTerm,
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Filter Rfqs based on search term
  const filteredRfqs = Rfqs.filter((rfq) =>
    `${rfq.reference_id} ${rfq.vendor_name} ${rfq.contact_name} ${rfq.email} ${rfq.mobile} ${rfq.entity} ${rfq.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination after filtering
  const totalPages = Math.ceil(filteredRfqs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRfqs = filteredRfqs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNum) => {
    if (onPageChange && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  return (
    <Box m="20px">
      <Header title="RFQ Management" subtitle="Admin/RFQ" />

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        {/* Search and Items Per Page Controls */}
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
          <div className="me-3 mb-2" style={{ flex: 1, minWidth: "200px" }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="d-flex align-items-center mb-2">
            <label htmlFor="limitSelect" className="form-label me-2 mb-0 text-body">
              Items per page:
            </label>
            <select
              id="limitSelect"
              className="form-select"
              style={{ width: "250px" }}
              value={itemsPerPage}
              onChange={(e) => {
                onLimitChange(parseInt(e.target.value, 10));
                onPageChange(1); // Reset to page 1
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

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle text-center">
           <thead className="table-dark">
  <tr>
    <th>Reference ID</th>
    <th>Vendor Name</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>
</thead>
<tbody>
  {paginatedRfqs.length === 0 ? (
    <tr>
      <td colSpan="4" className="text-center text-muted">
        No RFQs found.
      </td>
    </tr>
  ) : (
    paginatedRfqs.map((data) => (
      <tr key={data.id}>
        <td>{data.reference_id}</td>
        <td>{data.vendor_name}</td>
        <td>{data.status_name}</td>
        <td>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => navigate(`/review-vendor/${data.reference_id}`)}
          >
           Review
          </button>
         
        </td>
      </tr>
    ))
  )}
</tbody>

          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="form-label me-2 mb-0 text-body">
            Showing {paginatedRfqs.length} of {filteredRfqs.length} matching RFQs
          </span>
          <div>
            <button
              className="btn btn-outline-secondary btn-sm me-1"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`btn btn-sm me-1 ${
                  currentPage === index + 1 ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Box>
  );
}

RfqTable.propTypes = {
  Rfqs: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  total: PropTypes.number,
  itemsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchTerm: PropTypes.string.isRequired,
};

export default RfqTable;

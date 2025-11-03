import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";

function CostCenterTable({
                             costCenters,
                             deleteCostCenter,
                             editCostCenter,
                             currentPage,
                             total,
                             itemsPerPage,
                             onPageChange,
                             onLimitChange,
                             onSearch,
                             searchTerm,
                         }) {
    const theme = useTheme();

    // Filtered by search term (optional)
    const filteredCostCenters = costCenters.filter((cc) =>
        `${cc.cc_code} ${cc.cc_type} ${cc.entity_id} ${cc.city} ${cc.state} ${cc.country}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(total / itemsPerPage);
    const paginatedCostCenters = filteredCostCenters;

    const goToPage = (pageNum) => {
        if (onPageChange && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        }
    };

    return (
        <Box m="20px">
            <Header title="Cost Center Management" subtitle="Admin/CostCenter" />

            <div className="container mt-4 p-3 bg-white rounded shadow-sm">
                {/* Search and Items Per Page */}
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
                                onPageChange(1);
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
                            <th>ID</th>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Entity</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>GST No</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedCostCenters.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center text-muted">
                                    No cost centers found.
                                </td>
                            </tr>
                        ) : (
                            paginatedCostCenters.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.id}</td>
                                    <td>{data.cc_code}</td>
                                    <td>{data.cc_type}</td>
                                    <td>{data.entity_id}</td>
                                    <td>{data.city}</td>
                                    <td>{data.state}</td>
                                    <td>{data.country}</td>
                                    <td>{data.gst_no}</td>
                                    {/* ✅ FIXED here */}
                                    <td>{data.status_id === 1 ? "Active" : "Inactive"}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => editCostCenter(data)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => deleteCostCenter(data.id)}
                                        >
                                            Delete
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
            Showing {paginatedCostCenters.length} of {total} matching cost centers
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

CostCenterTable.propTypes = {
    costCenters: PropTypes.array.isRequired,
    deleteCostCenter: PropTypes.func.isRequired,
    editCostCenter: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    total: PropTypes.number,
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onLimitChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
};

export default CostCenterTable;

 
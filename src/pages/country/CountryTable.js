import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";

function CountryTable({
                          countries,
                          deleteCountry,
                          editCountry,
                          currentPage,
                          total,
                          itemsPerPage,
                          onPageChange,
                          onLimitChange,
                          onSearch,
                          searchTerm,
                      }) {
    const totalPages = Math.ceil(total / itemsPerPage);

    const goToPage = (pageNum) => {
        if (onPageChange && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        }
    };

    return (
        <Box m="20px">
            <Header title="Country Management" subtitle="Admin/Country" />

            <div className="container mt-4 p-3 bg-white rounded shadow-sm">
                {/* Search and Limit selector row */}
                <div className="row mb-3 align-items-center">
                    <div className="col-md-6">
                        <input
                            type="text"
                            placeholder="Search by country name"
                            value={searchTerm}
                            onChange={(e) => {
                                onSearch(e.target.value);
                                onPageChange(1); // reset to page 1 on search
                            }}
                            className="form-control"
                        />
                    </div>

                    <div className="col-md-3">
                        <label htmlFor="limitSelect" className="form-label">
                            Items per page:
                        </label>
                        <select
                            id="limitSelect"
                            className="form-select"
                            value={itemsPerPage}
                            onChange={(e) => {
                                onLimitChange(parseInt(e.target.value, 10));
                                onPageChange(1); // reset to page 1 on limit change
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
                            <th>Country</th>
                            <th>Code</th>
                            <th>Currency</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {countries.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">
                                    No countries found.
                                </td>
                            </tr>
                        ) : (
                            countries.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.country}</td>
                                    <td>{data.code}</td>
                                    <td>{data.currency}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => editCountry(data)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => deleteCountry(data.id)}
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
          <span>
            Showing {countries.length} of {total} countries
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
                                    currentPage === index + 1
                                        ? "btn-primary"
                                        : "btn-outline-secondary"
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

CountryTable.propTypes = {
    countries: PropTypes.array.isRequired,
    deleteCountry: PropTypes.func.isRequired,
    editCountry: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onLimitChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
};

export default CountryTable;

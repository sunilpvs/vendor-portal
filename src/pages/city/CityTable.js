import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Header from "../../components/Header";

function CityTable({
                       cities,
                       deleteCity,
                       editCity,
                       currentPage,
                       total, // not used in frontend search anymore but still accepted for compatibility
                       itemsPerPage,
                       onPageChange,
                       onLimitChange,
                       onSearch,
                       searchTerm,
                   }) {
    const theme = useTheme();


    // Filter cities based on search term
    const filteredCities = cities.filter((city) =>
        `${city.city} ${city.state} ${city.country}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // Pagination after filtering
    const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCities = filteredCities.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (pageNum) => {
        if (onPageChange && pageNum >= 1 && pageNum <= totalPages) {
            onPageChange(pageNum);
        }
    };

    return (
        <Box m="20px">
            <Header title="City Management" subtitle="Admin/City" />

            <div className="container mt-4 p-3 bg-white rounded shadow-sm">
                {/* Search and Items Per Page Controls */}
                <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                    {/* Search Field */}
                    <div className="me-3 mb-2" style={{ flex: 1, minWidth: "200px" }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                onSearch(e.target.value); // just updates searchTerm in parent
                            }}
                            className="form-control"
                        />
                    </div>

                    {/* Items Per Page */}
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
                            <th>ID</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedCities.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center text-muted">
                                    No cities found.
                                </td>
                            </tr>
                        ) : (
                            paginatedCities.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.id}</td>
                                    <td>{data.city}</td>
                                    <td>{data.state}</td>
                                    <td>{data.country}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => editCity(data)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => deleteCity(data.id)}
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
            Showing {paginatedCities.length} of {filteredCities.length} matching cities
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

CityTable.propTypes = {
    cities: PropTypes.array.isRequired,
    deleteCity: PropTypes.func.isRequired,
    editCity: PropTypes.func.isRequired,
    currentPage: PropTypes.number.isRequired,
    total: PropTypes.number, // optional now
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    onLimitChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired,
};

export default CityTable;

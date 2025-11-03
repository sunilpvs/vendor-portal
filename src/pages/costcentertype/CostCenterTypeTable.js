import { Box } from "@mui/material";
import Header from "../../components/Header";

const CostCenterTypeTable = ({
  data,
  deleteItem,
  editItem,
  currentPage,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  onSearch,
  searchTerm,
}) => {
  const filtered = data.filter((item) =>
    item.cc_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box m="20px">
      <Header title="Cost Center Type Management" subtitle="Admin/CostCenterType" />

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="form-control me-3 mb-2"
            style={{ flex: 1, minWidth: "200px" }}
          />
          <div className="d-flex align-items-center mb-2">
            <label className="form-label me-2 mb-0 text-body">Items per page:</label>
            <select
              className="form-select"
              value={itemsPerPage}
              onChange={(e) => {
                onLimitChange(parseInt(e.target.value, 10));
                onPageChange(1);
              }}
            >
              {[5, 10, 20].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Cost Center Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="3">No results</td></tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.cc_type}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => editItem(item)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="form-label text-body">
            Showing {paginated.length} of {filtered.length}
          </span>
          <div>
            <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm me-1 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default CostCenterTypeTable;
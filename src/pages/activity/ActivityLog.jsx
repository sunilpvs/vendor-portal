import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import { getActivities } from "../../services/admin/activiyLogService";

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [minDate, setMinDate] = useState("");
    const [maxDate, setMaxDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [loading, setLoading] = useState(false);

    const logsPerPage = 10;

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const response = await getActivities(currentPage, logsPerPage, null, null, minDate, maxDate);
                const data = response.data;

                if (data && Array.isArray(data.logs)) {
                    setLogs(data.logs);
                    setTotalLogs(data.total || 0);
                } else {
                    setLogs([]);
                    setTotalLogs(0);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
                setLogs([]);
                setTotalLogs(0);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [currentPage, minDate, maxDate]);

    const totalPages = Math.ceil(totalLogs / logsPerPage);

    return (
        <Box m="50px" p={3}>
            <Header title="Activity Logs" subtitle="Search by date range" />

            <div className="container mt-4 p-3 bg-white rounded shadow-sm">
                <div className="row mb-3">
                    <div className="col-md-4 mb-2">
                        <label className="form-label fw-bold text-muted">Min Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={minDate}
                            onChange={(e) => {
                                setMinDate(e.target.value);
                                setCurrentPage(1); // Reset to page 1
                            }}
                        />
                    </div>
                    <div className="col-md-4 mb-2">
                        <label className="form-label fw-bold text-muted">Max Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={maxDate}
                            onChange={(e) => {
                                setMaxDate(e.target.value);
                                setCurrentPage(1); // Reset to page 1
                            }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover table-striped table-bordered align-middle">
                        <thead className="table-primary">
                        <tr>
                            <th className="text-center">Date Time</th>
                            <th className="text-center">Activity</th>
                            <th className="text-center">Log</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="text-center text-muted">Loading...</td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.map((entry, index) => (
                                <tr key={index}>
                                    <td>{new Date(entry.datetime).toLocaleString()}</td>
                                    <td>{entry.activity}</td>
                                    <td>{entry.log}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center text-muted">
                                    No activity found for selected date range.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="mt-3">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <li
                                    key={page}
                                    className={`page-item ${currentPage === page ? "active" : ""}`}
                                >
                                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                                        {page}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </Box>
    );
};

export default ActivityLog;

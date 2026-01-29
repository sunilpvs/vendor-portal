import React, { useState, useEffect } from "react";
import { getReferenceId, getRfqStatus } from "../../services/vms/referenceIdService";
import { getVendorInfo } from "../../services/vms/vendorService";
import { Box } from "@mui/material";
import Header from "../../components/Header";

const VendorInfoPage = () => {
  const [vendorInfo, setVendorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendorInfo = async () => {
      try {
        setLoading(true);
        const response = await getVendorInfo();
        setVendorInfo(response?.data?.vendor_info || null);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch vendor info:", err);
        
        // Handle 404 - vendor not found case
        if (err.response?.status === 404 || err.response?.data?.vendor) {
          setVendorInfo(null);
          setError(null);
        } else {
          setError("Failed to load vendor information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVendorInfo();
  }, []);

  return (
    <Box m="20px">
      <Header title="Vendor Information" subtitle="Your vendor details" />

      <div className="container mt-4 p-3 bg-white rounded shadow-sm">
        {loading && (
          <div className="text-center py-4">
            <p className="text-muted">Loading vendor information...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {!vendorInfo?.vendor_code ? (
              <div className="alert alert-info" role="alert">
                No vendor code is present
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-4">Vendor Details</h5>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Vendor Code:</strong>
                      <p className="mb-0">{vendorInfo.vendor_code}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong>
                      <p className="mb-0">
                        <span
                          className={`badge ${
                            vendorInfo.status === 'Active' ? 'bg-success' : 
                            vendorInfo.status === 'Inactive' ? 'bg-secondary' : 
                            'bg-warning'
                          }`}
                          style={{
                            fontSize: '0.9rem',
                            padding: '0.25rem 0.6rem',
                            fontWeight: 600,
                            borderRadius: '0.5rem'
                          }}
                        >
                          {vendorInfo.status || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Active RFQ ID:</strong>
                      <p className="mb-0">{vendorInfo.active_reference_id || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Expiry Date:</strong>
                      <p className="mb-0">
                        {vendorInfo.expiry_date 
                          ? new Date(vendorInfo.expiry_date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Box>
  );
};

export default VendorInfoPage;

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { toast } from "react-hot-toast";
import "./EntityRfqPage.css";

const EntityRfqPage = () => {
  const [entities, setEntities] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState([]);

  // ✅ Dummy Data Setup
  useEffect(() => {
    const dummyEntities = [
      { id: "1", name: "Shrichandra Data Entry" },
      { id: "2", name: "Global Exim Pvt Ltd" },
      { id: "3", name: "Tanmayee Logistics" },
      { id: "4", name: "Shri Chandra Global Logistics" },
      { id: "5", name: "Omkar Engineering Works" },
      { id: "6", name: "Krishna Enterprises" },
      { id: "7", name: "Elite Tech Solutions" },
      { id: "8", name: "Skyline Industries" },
    ];

    const dummyVendors = [
      { id: "V001", name: "Vendor A", assignedEntities: ["1"] },
      { id: "V002", name: "Vendor B", assignedEntities: ["1"] },
      { id: "V003", name: "Vendor C", assignedEntities: ["2"] },
      { id: "V004", name: "Vendor D", assignedEntities: ["3"] },
      { id: "V005", name: "Vendor E", assignedEntities: ["4"] },
      { id: "V006", name: "Vendor F", assignedEntities: ["5"] },
      { id: "V007", name: "Vendor G", assignedEntities: ["6"] },
      { id: "V008", name: "Vendor H", assignedEntities: ["7"] },
      { id: "V009", name: "Vendor I", assignedEntities: ["8"] },
    ];

    setEntities(dummyEntities);
    setVendors(dummyVendors);
  }, []);

  // ✅ Handle Entity Selection
  const handleEntitySelect = (e) => {
    setSelectedEntity(e.target.value);
  };

  // ✅ Filter vendors belonging to selected entity
  const filteredVendors = vendors.filter((v) =>
    v.assignedEntities.includes(selectedEntity)
  );

  // ✅ Handle Enable Button Click
  const handleEnable = (vendor) => {
    setSelectedVendor(vendor);
    setSelectedEntities([]);
    setOpen(true);
  };

  // ✅ Checkbox Select Handler
  const handleSelectEntity = (id) => {
    setSelectedEntities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ✅ Submit Handler
  const handleSubmit = () => {
    if (!selectedVendor || selectedEntities.length === 0) {
      toast.error("Please select at least one entity!");
      return;
    }

    setVendors((prev) =>
      prev.map((v) =>
        v.id === selectedVendor.id
          ? {
              ...v,
              assignedEntities: Array.from(
                new Set([...v.assignedEntities, ...selectedEntities])
              ),
            }
          : v
      )
    );

    toast.success(`${selectedVendor.name} assigned to selected entities.`);
    setOpen(false);
  };

  // ✅ Remaining entities (exclude already assigned)
  const remainingEntities = entities.filter(
    (ent) =>
      !selectedVendor?.assignedEntities?.includes(ent.id) &&
      ent.id !== selectedEntity
  );

  return (
    <Box className="vmsContainer">
      <div className="vmsWrapper">
        <Typography className="pageTitle">Entity-wise Vendor Management</Typography>

        {/* Select Entity Dropdown */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ color: "#000", marginRight: "10px",fontSize:"20px" }}>Select Entity:</label>
         <select
  value={selectedEntity}
  onChange={handleEntitySelect}
  style={{
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid gray",
    background: "#fff",
    color: "#000",
    width: "350px", // ✅ increased width
  }}
>
            <option value="">-- Select Entity --</option>
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Table */}
        {selectedEntity && (
          <>
            <Typography className="sectionTitle">
              Vendors under {entities.find((e) => e.id === selectedEntity)?.name}
            </Typography>

            <Table className="rfqTable">
              <TableHead>
                <TableRow>
                  <TableCell>Vendor ID</TableCell>
                  <TableCell>Vendor Name</TableCell>
                  <TableCell>Assigned Entities</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.id}</TableCell>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>
                        {v.assignedEntities
                          .map(
                            (id) =>
                              entities.find((e) => e.id === id)?.name || "-"
                          )
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleEnable(v)}
                        >
                          Enable
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} style={{ textAlign: "center" }}>
                      No vendors found for this entity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}

        {/* Popup */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ className: "dialogDark" }}
        >
          <DialogTitle>
            Assign {selectedVendor?.name} to Other Entities
          </DialogTitle>
          <DialogContent dividers>
            {remainingEntities.length === 0 ? (
              <Typography>No remaining entities available.</Typography>
            ) : (
              remainingEntities.map((ent) => (
                <FormControlLabel
                  key={ent.id}
                  control={
                    <Checkbox
                      checked={selectedEntities.includes(ent.id)}
                      onChange={() => handleSelectEntity(ent.id)}
                      sx={{ color: "#000" }}
                    />
                  }
                  label={ent.name}
                  sx={{
                    color: "#000",
                    display: "block",
                    marginBottom: "10px",
                  }}
                />
              ))
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} sx={{  color: "white", background: "black"  }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSubmit}
              sx={{ color: "white", background: "green" }}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );
};

export default EntityRfqPage;

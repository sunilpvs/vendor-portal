import { Box, Typography, useTheme } from "@mui/material";
import Header from "../../components/Header";

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box m="20px" display="flex" justifyContent="center">
      <Box
        width="50%" // half of the page width
        bgcolor={theme.palette.background.paper}
        p={4}
        borderRadius="12px"
        boxShadow={3}
      >
        {/* Page Heading */}
        <Header title="My RFQs" subtitle="Manage your Requests for Quotation" />

        {/* Example RFQ content placeholder */}
        <Typography variant="body1" mt={2}>
          Here your RFQs list will appear. You can Add, Edit, or View details.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;

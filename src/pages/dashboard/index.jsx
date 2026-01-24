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
        <Header title="Vendor Dashboard" subtitle="VMS" />

        {/* Example RFQ content placeholder */}
        <Typography variant="body3" fontSize={15} mt={2}>
          Welcome to the Vendor Dashboard! Here you can manage your RFQs,
          view statuses, and access important vendor resources. <br /> <br />
          Please navigate using the sidebar to explore different sections.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;

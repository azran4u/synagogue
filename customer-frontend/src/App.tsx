import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { PrayerCardPage } from "./pages/PrayerCardPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import Footer from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { he } from "date-fns/locale";

export const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Router>
          <Sidebar />
          <Box sx={{ flex: 1, marginTop: "4rem" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/prayer-card" element={<PrayerCardPage />} />
              <Route path="/prayer-times" element={<PrayerTimesPage />} />
            </Routes>
          </Box>
          <Footer />
        </Router>
      </Box>
    </LocalizationProvider>
  );
};

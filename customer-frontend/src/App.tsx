import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import PrayerCardPage from "./pages/PrayerCardPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import Footer from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { he } from "date-fns/locale";
import ToraLessonsPage from "./pages/ToraLessonsPage";
import DonationsPage from "./pages/DonationsPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";

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
              <Route
                path="/financial-reports"
                element={<FinancialReportsPage />}
              />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/prayer-card" element={<PrayerCardPage />} />
              <Route path="/prayer-times" element={<PrayerTimesPage />} />
              <Route path="/tora-lessons" element={<ToraLessonsPage />} />

              <Route path="/" element={<HomePage />} />
            </Routes>
          </Box>
          <Footer />
        </Router>
      </Box>
    </LocalizationProvider>
  );
};

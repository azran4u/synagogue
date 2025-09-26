import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import { Sidebar } from "./components/Sidebar";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { he } from "date-fns/locale";
import SynagoguesPage from "./pages/SynagoguesPage";
import { SynagogueProvider } from "./components/SynagogueProvider";
import SynagogueSettingsPage from "./pages/SynagogueSettingsPage";
import PrayerEventTypesPage from "./pages/PrayerEventTypesPage";
import SynagogueHomePage from "./pages/SynagogueHomePage";
import PrayerCardPage from "./pages/PrayerCardPage";
import AdminPrayerEventTypesPage from "./pages/AdminPrayerEventTypesPage";
import AdminAliyaTypesPage from "./pages/AdminAliyaTypesPage";
import AdminAliyaAssignmentPage from "./pages/AdminAliyaAssignmentPage";

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
          <SynagogueProvider>
            <Sidebar />
            <Box sx={{ flex: 1, marginTop: "4rem" }}>
              <Routes>
                <Route path="/" element={<SynagogueHomePage />} />
                <Route
                  path="/synagogue/:synagogueId/prayer-card"
                  element={<PrayerCardPage />}
                />
                <Route
                  path="/synagogue/:synagogueId/settings"
                  element={<SynagogueSettingsPage />}
                />
                <Route
                  path="/synagogue/:synagogueId/prayer-event-types"
                  element={<PrayerEventTypesPage />}
                />
                <Route
                  path="/synagogue/:synagogueId"
                  element={<SynagogueHomePage />}
                />
                <Route path="/synagogues" element={<SynagoguesPage />} />
                <Route
                  path="/synagogue/:synagogueId/admin/prayer-event-types"
                  element={<AdminPrayerEventTypesPage />}
                />
                <Route
                  path="/synagogue/:synagogueId/admin/aliya-types"
                  element={<AdminAliyaTypesPage />}
                />
                <Route
                  path="/synagogue/:synagogueId/admin/aliya-assignment"
                  element={<AdminAliyaAssignmentPage />}
                />
              </Routes>
            </Box>
            <Footer />
          </SynagogueProvider>
        </Router>
      </Box>
    </LocalizationProvider>
  );
};

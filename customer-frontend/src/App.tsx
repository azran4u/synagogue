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
import AdminPrayerCardsPage from "./pages/AdminPrayerCardsPage";
import AdminFrontendErrorsPage from "./pages/AdminFrontendErrorsPage";
import AdminPrayerTimesPage from "./pages/AdminPrayerTimesPage";
import AdminToraLessonsPage from "./pages/AdminToraLessonsPage";
import AdminFinancialReportsPage from "./pages/AdminFinancialReportsPage";
import AdminDonationsPage from "./pages/AdminDonationsPage";
import AdminUpcomingEventsPage from "./pages/AdminUpcomingEventsPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import ToraLessonsPage from "./pages/ToraLessonsPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import DonationsPage from "./pages/DonationsPage";
import { FrontendErrorServiceProvider } from "./components/FrontendErrorServiceProvider";

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
            <FrontendErrorServiceProvider>
              <Sidebar />
              <Box sx={{ flex: 1, marginTop: "4rem" }}>
                <Routes>
                  <Route path="/" element={<SynagogueHomePage />} />
                  <Route
                    path="/synagogue/:synagogueId/prayer-card"
                    element={<PrayerCardPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/settings"
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
                  <Route
                    path="/synagogue/:synagogueId/admin/prayer-cards"
                    element={<AdminPrayerCardsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/frontend-errors"
                    element={<AdminFrontendErrorsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/prayer-times"
                    element={<AdminPrayerTimesPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/tora-lessons"
                    element={<AdminToraLessonsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/financial-reports"
                    element={<AdminFinancialReportsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/donations"
                    element={<AdminDonationsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/admin/upcoming-events"
                    element={<AdminUpcomingEventsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/tora-lessons"
                    element={<ToraLessonsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/prayer-times"
                    element={<PrayerTimesPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/financial-reports"
                    element={<FinancialReportsPage />}
                  />
                  <Route
                    path="/synagogue/:synagogueId/donations"
                    element={<DonationsPage />}
                  />
                </Routes>
              </Box>
              <Footer />
            </FrontendErrorServiceProvider>
          </SynagogueProvider>
        </Router>
      </Box>
    </LocalizationProvider>
  );
};

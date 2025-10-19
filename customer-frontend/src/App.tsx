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
import AdminAliyaHistoryPage from "./pages/AdminAliyaHistoryPage";
import AdminPrayerCardsPage from "./pages/AdminPrayerCardsPage";
import AdminFrontendErrorsPage from "./pages/AdminFrontendErrorsPage";
import AdminPrayerTimesPage from "./pages/AdminPrayerTimesPage";
import AdminToraLessonsPage from "./pages/AdminToraLessonsPage";
import AdminFinancialReportsPage from "./pages/AdminFinancialReportsPage";
import AdminDonationsPage from "./pages/AdminDonationsPage";
import AdminPrayerDonationsPage from "./pages/AdminPrayerDonationsPage";
import AdminUpcomingEventsPage from "./pages/AdminUpcomingEventsPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import ToraLessonsPage from "./pages/ToraLessonsPage";
import FinancialReportsPage from "./pages/FinancialReportsPage";
import DonationsPage from "./pages/DonationsPage";
import { FrontendErrorServiceProvider } from "./components/FrontendErrorServiceProvider";
import { SynagogueThemeProvider } from "./components/SynagogueThemeProvider";

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
            <SynagogueThemeProvider>
              <FrontendErrorServiceProvider>
                <Sidebar />
                <Box sx={{ flex: 1, marginTop: "4rem" }}>
                  <Routes>
                    <Route path="/synagogues" element={<SynagoguesPage />} />
                    <Route
                      path="/"
                      element={
                        <SynagogueThemeProvider>
                          <SynagogueHomePage />
                        </SynagogueThemeProvider>
                      }
                    />
                    <Route
                      path="/synagogue/*"
                      element={
                        <Routes>
                          <Route path="/" element={<SynagogueHomePage />} />
                          <Route
                            path="/:synagogueId"
                            element={<SynagogueHomePage />}
                          />
                          <Route
                            path="/:synagogueId/prayer-card"
                            element={<PrayerCardPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/settings"
                            element={<SynagogueSettingsPage />}
                          />
                          <Route
                            path="/:synagogueId/prayer-event-types"
                            element={<PrayerEventTypesPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/prayer-event-types"
                            element={<AdminPrayerEventTypesPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/aliya-types"
                            element={<AdminAliyaTypesPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/aliya-assignment"
                            element={<AdminAliyaAssignmentPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/aliya-history"
                            element={<AdminAliyaHistoryPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/prayer-cards"
                            element={<AdminPrayerCardsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/frontend-errors"
                            element={<AdminFrontendErrorsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/prayer-times"
                            element={<AdminPrayerTimesPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/tora-lessons"
                            element={<AdminToraLessonsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/financial-reports"
                            element={<AdminFinancialReportsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/donations"
                            element={<AdminDonationsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/prayer-donations"
                            element={<AdminPrayerDonationsPage />}
                          />
                          <Route
                            path="/:synagogueId/admin/upcoming-events"
                            element={<AdminUpcomingEventsPage />}
                          />
                          <Route
                            path="/:synagogueId/tora-lessons"
                            element={<ToraLessonsPage />}
                          />
                          <Route
                            path="/:synagogueId/prayer-times"
                            element={<PrayerTimesPage />}
                          />
                          <Route
                            path="/:synagogueId/financial-reports"
                            element={<FinancialReportsPage />}
                          />
                          <Route
                            path="/:synagogueId/donations"
                            element={<DonationsPage />}
                          />
                        </Routes>
                      }
                    />
                  </Routes>
                </Box>
                <Footer />
              </FrontendErrorServiceProvider>
            </SynagogueThemeProvider>
          </SynagogueProvider>
        </Router>
      </Box>
    </LocalizationProvider>
  );
};

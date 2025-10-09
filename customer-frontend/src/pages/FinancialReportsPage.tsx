import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useEnabledFinancialReports } from "../hooks/useFinancialReports";
import { FinancialReport } from "../model/FinancialReports";

const FinancialReportsPage: React.FC = () => {
  const { data: reports, isLoading, error } = useEnabledFinancialReports();

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען דוחות כספיים...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת דוחות כספיים: {error.message}
        </Alert>
      </Box>
    );
  }

  const sortedReports = reports
    ? [...reports].sort(
        (a: FinancialReport, b: FinancialReport) =>
          a.displayOrder - b.displayOrder
      )
    : [];

  const handleDownload = (url: string, title: string) => {
    window.open(url, "_blank");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: 4 }}
      >
        דוחות כספיים
      </Typography>

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <ReportIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין דוחות כספיים זמינים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הדוחות הכספיים יתפרסמו בקרוב
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {sortedReports.map((report: FinancialReport) => (
            <Card key={report.id} elevation={3}>
              <CardContent>
                {/* Report Title */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <ReportIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5">{report.title}</Typography>
                    {report.isRecent && (
                      <Chip
                        label="חדש"
                        color="success"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Report Details */}
                <Stack spacing={2}>
                  {/* Date */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CalendarIcon color="action" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        תאריך עברי
                      </Typography>
                      <Typography variant="body1">
                        {report.hebrewDate.toString()}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {report.content}
                    </Typography>
                  </Box>

                  {/* Download Button */}
                  {report.linkToDocument && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          handleDownload(report.linkToDocument, report.title)
                        }
                        sx={{ minWidth: 200 }}
                      >
                        הורד דוח מלא
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FinancialReportsPage;

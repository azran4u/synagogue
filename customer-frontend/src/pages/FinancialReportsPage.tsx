import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Link,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  AccessTime as TimeIcon,
  NewReleases as NewIcon,
} from "@mui/icons-material";
import { FinancialReport } from "../model/FinancialReports";
import { useFinancialReports } from "../hooks/useFinancialReports";

const FinancialReportsPage: React.FC = () => {
  const { data: reports, isLoading, error } = useFinancialReports();

  // Sort reports by publication date (newest first)
  const sortedReports = useMemo(() => {
    return (
      reports?.sort(
        (a, b) =>
          b.publicationDate.toGregorianDate().getTime() -
          a.publicationDate.toGregorianDate().getTime()
      ) || []
    );
  }, [reports]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          שגיאה בטעינת דוחות כספיים: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom align="center">
          דוחות כספיים
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          אין דוחות כספיים זמינים כרגע
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          דוחות כספיים
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          דוחות כספיים מפורסמים של בית הכנסת
        </Typography>
      </Box>

      {/* Statistics */}
      <Box mb={4}>
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          }}
          gap={2}
        >
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {reports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                דוחות סה"כ
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {reports.filter(r => r.isRecent).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                דוחות אחרונים
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {new Set(reports.map(r => r.publishedBy)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מפרסמים
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {reports.filter(r => r.hasNotes).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                עם הערות
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Reports List */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={3}
      >
        {sortedReports.map((report: FinancialReport) => (
          <Card
            elevation={3}
            key={report.id}
            sx={{
              height: "fit-content",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              {/* Report Header */}
              <Box mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AssessmentIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold" flex={1}>
                    {report.title}
                  </Typography>
                  {report.isRecent && (
                    <Chip
                      icon={<NewIcon />}
                      label="חדש"
                      color="error"
                      size="small"
                    />
                  )}
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {report.formattedPublicationDate}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    פורסם על ידי: {report.publishedBy}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Report Details */}
              <Box mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <TimeIcon fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    גיל הדוח: {report.ageInDays} ימים
                  </Typography>
                </Box>

                {report.hasNotes && (
                  <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {report.notes}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box display="flex" justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<PdfIcon />}
                  component={Link}
                  href={report.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  צפה בדוח
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Summary */}
      <Box mt={4} p={3} bgcolor="background.paper" borderRadius={2}>
        <Typography variant="h6" gutterBottom align="center">
          סיכום
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          הדוחות הכספיים מתפרסמים באופן קבוע ומספקים שקיפות מלאה על הפעילות
          הכספית של בית הכנסת.
          <br />
          לכל שאלה או הבהרה, אנא פנו אל הגזבר או חברי הוועד.
        </Typography>
      </Box>
    </Box>
  );
};

export default FinancialReportsPage;

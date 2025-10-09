import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as ReportIcon,
  InsertDriveFile as FileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  useFinancialReports,
  useCreateFinancialReport,
  useUpdateFinancialReport,
  useDeleteFinancialReport,
} from "../hooks/useFinancialReports";
import { useUser } from "../hooks/useUser";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { FinancialReport } from "../model/FinancialReports";
import { HebrewDate } from "../model/HebrewDate";
import FinancialReportForm from "../components/FinancialReportForm";
import { WithLogin } from "../components/WithLogin";
import { storageService } from "../services/storageService";

interface FinancialReportFormValues {
  title: string;
  content: string;
  displayOrder: number;
  enabled: boolean;
  linkToDocument: string;
  hebrewDate: HebrewDate;
}

const AdminFinancialReportsContent: React.FC = () => {
  const { data: reports, isLoading, error } = useFinancialReports();
  const createReport = useCreateFinancialReport();
  const updateReport = useUpdateFinancialReport();
  const deleteReport = useDeleteFinancialReport();
  const { isGabaiOrHigher, email } = useUser();
  const synagogueId = useAppSelector(selectSelectedSynagogueId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<FinancialReport | null>(
    null
  );

  // Check permissions
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  const handleOpenDialog = (report?: FinancialReport) => {
    setEditingReport(report || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingReport(null);
  };

  const handleSubmit = async (
    values: FinancialReportFormValues,
    file: File | null
  ) => {
    try {
      if (editingReport) {
        // Update existing report
        let documentURL = values.linkToDocument;
        let fileExtension = editingReport.fileExtension;

        // If a new file was uploaded
        if (file && synagogueId) {
          // Get file extension
          const extension = file.name.split(".").pop() || "pdf";

          // Delete old file if extension changed
          if (fileExtension && fileExtension !== extension) {
            const oldPath = `${synagogueId}/financialReports/${editingReport.id}.${fileExtension}`;
            try {
              await storageService.deleteFile(oldPath);
            } catch (error) {
              console.error("Failed to delete old file:", error);
              // Continue even if deletion fails
            }
          }

          // Use report ID as filename
          const path = `${synagogueId}/financialReports/${editingReport.id}.${extension}`;
          documentURL = await storageService.uploadFile(file, path);
          fileExtension = extension;
        }

        const updatedReport = editingReport.update({
          ...values,
          linkToDocument: documentURL,
          fileExtension: fileExtension,
        });
        await updateReport.mutateAsync(updatedReport);
      } else {
        // Create new report - first create the report to get an ID
        const newReport = FinancialReport.create(
          values.title,
          "", // Empty document URL for now
          email || "unknown",
          values.content,
          values.displayOrder,
          values.hebrewDate
        );

        // Set enabled status
        const reportToSave = values.enabled ? newReport : newReport.disable();

        // Upload file if provided
        let documentURL = "";
        let fileExtension: string | undefined;
        if (file && synagogueId) {
          // Get file extension
          const extension = file.name.split(".").pop() || "pdf";
          // Use report ID as filename
          const path = `${synagogueId}/financialReports/${reportToSave.id}.${extension}`;
          documentURL = await storageService.uploadFile(file, path);
          fileExtension = extension;
        }

        // Update report with document URL and extension
        const reportWithDocument = reportToSave.update({
          linkToDocument: documentURL,
          fileExtension: fileExtension,
        });

        await createReport.mutateAsync(reportWithDocument);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save financial report:", error);
      alert("שגיאה בשמירת הדוח");
    }
  };

  const handleOpenDeleteDialog = (report: FinancialReport) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (reportToDelete && synagogueId) {
      try {
        // Delete the file from storage using report ID and extension
        if (reportToDelete.fileExtension) {
          const path = `${synagogueId}/financialReports/${reportToDelete.id}.${reportToDelete.fileExtension}`;
          try {
            await storageService.deleteFile(path);
          } catch (error) {
            console.error("Failed to delete file from storage:", error);
            // Continue with report deletion even if file deletion fails
          }
        }

        // Delete the report from Firestore
        await deleteReport.mutateAsync(reportToDelete.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Failed to delete financial report:", error);
        alert("שגיאה במחיקת הדוח");
      }
    }
  };

  const handleDownload = (url: string, title: string) => {
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
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
    ? [...reports].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">ניהול דוחות כספיים</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף דוח
        </Button>
      </Box>

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <ReportIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין דוחות כספיים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הוסף דוח כספי ראשון
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sortedReports.map(report => (
            <Card key={report.id} elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">{report.title}</Typography>
                      <Chip
                        label={report.enabled ? "פעיל" : "לא פעיל"}
                        color={report.enabled ? "success" : "default"}
                        size="small"
                      />
                      <Chip
                        label={`סדר: ${report.displayOrder}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {report.contentPreview}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      נוצר על ידי: {report.createdBy} | תאריך עברי:{" "}
                      {report.hebrewDate.toString()}
                    </Typography>

                    {report.linkToDocument && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          handleDownload(report.linkToDocument, report.title)
                        }
                        sx={{ mt: 1 }}
                      >
                        הורד מסמך
                      </Button>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="ערוך">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(report)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(report)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReport ? "ערוך דוח כספי" : "הוסף דוח כספי"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FinancialReportForm
              report={editingReport}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={createReport.isPending || updateReport.isPending}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>מחק דוח כספי</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הדוח "{reportToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו תמחק גם את המסמך המצורף ולא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteReport.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteReport.isPending}
            startIcon={
              deleteReport.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteReport.isPending ? "מוחק..." : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AdminFinancialReportsPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminFinancialReportsContent />
    </WithLogin>
  );
};

export default AdminFinancialReportsPage;

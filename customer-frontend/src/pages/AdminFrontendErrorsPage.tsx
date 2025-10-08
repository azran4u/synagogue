import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  BugReport as BugIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  DeleteForever as DeleteAllIcon,
  DeleteSweep as DeleteFilteredIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useAllFrontendErrors } from "../hooks/useFrontendErrors";
import { useUser } from "../hooks/useUser";
import { WithLogin } from "../components/WithLogin";
import { frontendErrorService } from "../services/frontendErrorService";
import { useQueryClient } from "@tanstack/react-query";

const AdminFrontendErrorsPage: React.FC = () => {
  const { data: errors, isLoading, error, refetch } = useAllFrontendErrors();
  const queryClient = useQueryClient();
  const { isAdmin } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "single" | "all" | "filtered";
    errorId?: string;
  }>({ open: false, type: "single" });

  // Filter errors based on search term
  const filteredErrors = useMemo(() => {
    if (!errors) return [];
    if (!searchTerm.trim()) return errors;

    const searchLower = searchTerm.toLowerCase();
    return errors.filter(
      err =>
        err.errorMessage.toLowerCase().includes(searchLower) ||
        err.errorType.toLowerCase().includes(searchLower) ||
        (err.userEmail && err.userEmail.toLowerCase().includes(searchLower)) ||
        (err.url && err.url.toLowerCase().includes(searchLower))
    );
  }, [errors, searchTerm]);

  // Check if user is admin
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  // Get error type icon
  const getErrorTypeIcon = (errorType: string) => {
    switch (errorType.toLowerCase()) {
      case "javascript":
        return <BugIcon color="error" />;
      case "react":
        return <ErrorIcon color="error" />;
      case "promise":
        return <WarningIcon color="warning" />;
      case "console":
        return <InfoIcon color="info" />;
      default:
        return <BugIcon color="error" />;
    }
  };

  // Get error type color
  const getErrorTypeColor = (errorType: string) => {
    switch (errorType.toLowerCase()) {
      case "javascript":
        return "error";
      case "react":
        return "error";
      case "promise":
        return "warning";
      case "console":
        return "info";
      default:
        return "error";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  // Delete handlers
  const handleDeleteSingle = (errorId: string) => {
    setDeleteDialog({ open: true, type: "single", errorId });
  };

  const handleDeleteAll = () => {
    setDeleteDialog({ open: true, type: "all" });
  };

  const handleDeleteFiltered = () => {
    setDeleteDialog({ open: true, type: "filtered" });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const { type, errorId } = deleteDialog;

      if (type === "single" && errorId) {
        await frontendErrorService.deleteById(errorId);
      } else if (type === "all" && errors) {
        // Delete all errors
        await Promise.all(
          errors.map(err => frontendErrorService.deleteById(err.id!))
        );
      } else if (type === "filtered" && filteredErrors) {
        // Delete filtered errors
        await Promise.all(
          filteredErrors.map(err => frontendErrorService.deleteById(err.id!))
        );
      }

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["frontendErrors"] });
      setDeleteDialog({ open: false, type: "single" });
    } catch (error) {
      console.error("Error deleting errors:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, type: "single" });
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        שגיאות Frontend
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="חיפוש שגיאות..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <Tooltip title="נקה חיפוש">
                <IconButton size="small" onClick={clearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Statistics */}
      {!isLoading && errors && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={4} alignItems="center">
              <Box>
                <Typography variant="h6">{errors.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ שגיאות
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6">{filteredErrors.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  שגיאות מסוננות
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Stack direction="row" spacing={1}>
                {filteredErrors.length > 0 && (
                  <Tooltip title="מחק שגיאות מסוננות">
                    <IconButton
                      color="warning"
                      onClick={handleDeleteFiltered}
                      disabled={isDeleting}
                    >
                      <DeleteFilteredIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="מחק כל השגיאות">
                  <IconButton
                    color="error"
                    onClick={handleDeleteAll}
                    disabled={isDeleting || errors.length === 0}
                  >
                    <DeleteAllIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error loading errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          שגיאה בטעינת השגיאות: {error.message}
        </Alert>
      )}

      {/* No errors */}
      {!isLoading && filteredErrors.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <BugIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? "לא נמצאו שגיאות המתאימות לחיפוש" : "אין שגיאות"}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Errors List */}
      {!isLoading && filteredErrors.length > 0 && (
        <Stack spacing={2} dir="ltr">
          {filteredErrors.map((error, index) => (
            <Card key={error.id || index} variant="outlined">
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {getErrorTypeIcon(error.errorType)}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {error.errorMessage}
                      </Typography>
                      <Tooltip title="מחק שגיאה">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSingle(error.id!)}
                          disabled={isDeleting}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(error.timestamp)}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ mb: 2, gap: 1 }}>
                      <Chip
                        label={error.errorType}
                        color={getErrorTypeColor(error.errorType) as any}
                        size="small"
                      />
                      {error.userEmail && (
                        <Chip
                          label={error.userEmail}
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>

                    {error.url && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, wordBreak: "break-all" }}
                      >
                        <strong>URL:</strong> {error.url}
                      </Typography>
                    )}

                    {error.errorStack && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Stack Trace:
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: "#f5f5f5",
                            p: 1,
                            borderRadius: 1,
                            fontFamily: "monospace",
                            fontSize: { xs: "0.65rem", sm: "0.75rem" },
                            whiteSpace: "pre",
                            overflowX: "auto",
                            overflowY: "auto",
                            border: "1px solid #e0e0e0",
                            maxWidth: "100%",
                          }}
                        >
                          {error.errorStack}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={cancelDelete}>
        <DialogTitle>
          {deleteDialog.type === "single" && "מחק שגיאה"}
          {deleteDialog.type === "all" && "מחק כל השגיאות"}
          {deleteDialog.type === "filtered" && "מחק שגיאות מסוננות"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deleteDialog.type === "single" &&
              "האם אתה בטוח שברצונך למחוק שגיאה זו?"}
            {deleteDialog.type === "all" &&
              `האם אתה בטוח שברצונך למחוק את כל ${errors?.length || 0} השגיאות?`}
            {deleteDialog.type === "filtered" &&
              `האם אתה בטוח שברצונך למחוק את ${filteredErrors.length} השגיאות המסוננות?`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={isDeleting}>
            ביטול
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />
            }
          >
            {isDeleting ? "מוחק..." : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default () => {
  return (
    <WithLogin>
      <AdminFrontendErrorsPage />
    </WithLogin>
  );
};

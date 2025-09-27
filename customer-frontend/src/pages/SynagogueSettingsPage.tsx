import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useUpdateSynagogue, useDeleteSynagogue } from "../hooks/useSynagogues";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";

const SynagogueSettingsPage: React.FC = () => {
  const { synagogueId } = useParams<{ synagogueId: string }>();
  const navigate = useNavigate();
  const { data: synagogue, isLoading } = useSelectedSynagogue();
  const { user } = useAuth();
  const updateSynagogueMutation = useUpdateSynagogue();
  const deleteSynagogueMutation = useDeleteSynagogue();

  const [synagogueName, setSynagogueName] = useState(synagogue?.name || "");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Update synagogue name when synagogue data loads (but not during save operation)
  useEffect(() => {
    if (synagogue?.name && !isSaving) {
      setSynagogueName(synagogue.name);
    }
  }, [synagogue, isSaving]);

  const handleBackClick = () => {
    navigate(`/synagogue/${synagogueId}`);
  };

  const handleSaveSettings = async () => {
    if (!synagogue || !synagogueId || !user) return;

    if (synagogueName.trim() === "") {
      alert("שם בית הכנסת לא יכול להיות ריק");
      return;
    }

    if (synagogueName.trim() === synagogue.name) {
      return; // No changes to save
    }

    try {
      setIsSaving(true);
      setShowSuccessMessage(false);
      const updatedSynagogue = synagogue.update({ name: synagogueName.trim() });

      await updateSynagogueMutation.mutateAsync({
        id: synagogueId,
        synagogue: updatedSynagogue,
      });

      // Show success message
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving synagogue:", error);
      alert("שגיאה בשמירת השינויים");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSynagogue = async () => {
    if (!synagogueId) return;

    try {
      await deleteSynagogueMutation.mutateAsync(synagogueId);
      // Navigate to synagogues list after successful deletion
      navigate("/synagogues");
    } catch (error) {
      console.error("Error deleting synagogue:", error);
      alert("שגיאה במחיקת בית הכנסת");
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 3, textAlign: "center" }}>
        <Typography>טוען...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            חזור
          </Button>
          <Typography variant="h4">
            הגדרות בית כנסת {synagogue && `- ${synagogue.name}`}
          </Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            מידע כללי
          </Typography>
          <TextField
            fullWidth
            label="שם בית הכנסת"
            value={synagogueName}
            onChange={e => setSynagogueName(e.target.value)}
            sx={{ mb: 2 }}
          />
          {synagogue && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                מזהה: {synagogue.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                נוצר ב: {synagogue.formattedCreatedAt}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          השינויים נשמרו בהצלחה!
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="error">
            אזור מסוכן
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            מחיקת בית הכנסת היא פעולה בלתי הפיכה. כל הנתונים הקשורים לבית הכנסת
            יימחקו לצמיתות.
          </Alert>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteSynagogueMutation.isPending}
          >
            {deleteSynagogueMutation.isPending ? "מוחק..." : "מחק בית כנסת"}
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={handleBackClick}>
          ביטול
        </Button>
        <Button
          variant="contained"
          startIcon={
            showSuccessMessage ? (
              <CheckIcon />
            ) : isSaving ? (
              <CircularProgress size={16} />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSaveSettings}
          disabled={isSaving || synagogueName.trim() === synagogue?.name}
          color={showSuccessMessage ? "success" : "primary"}
        >
          {showSuccessMessage
            ? "נשמר בהצלחה!"
            : isSaving
              ? "שומר..."
              : "שמור הגדרות"}
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>מחיקת בית כנסת</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            אתה עומד למחוק את בית הכנסת "{synagogue?.name}" לצמיתות.
          </Alert>
          <Typography>
            פעולה זו תמחק את כל הנתונים הקשורים לבית הכנסת הזה, כולל:
          </Typography>
          <ul>
            <li>כרטיסי מתפללים</li>
            <li>עליות ואירועים</li>
            <li>סוגי עליות ואירועים</li>
            <li>קבוצות עליות</li>
          </ul>
          <Typography color="error" sx={{ fontWeight: "bold", mt: 2 }}>
            פעולה זו אינה הפיכה!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            disabled={deleteSynagogueMutation.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleDeleteSynagogue}
            color="error"
            variant="contained"
            disabled={deleteSynagogueMutation.isPending}
            startIcon={
              deleteSynagogueMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteSynagogueMutation.isPending ? "מוחק..." : "מחק לצמיתות"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SynagogueSettingsPage;

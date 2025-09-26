import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useState } from "react";

const SynagogueSettingsPage: React.FC = () => {
  const { synagogueId } = useParams<{ synagogueId: string }>();
  const navigate = useNavigate();
  const { data: synagogue, isLoading } = useSelectedSynagogue();

  const [synagogueName, setSynagogueName] = useState(synagogue?.name || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(false);

  const handleBackClick = () => {
    navigate(`/synagogue/${synagogueId}`);
  };

  const handleSaveSettings = () => {
    // TODO: Implement save settings functionality
    console.log("Saving settings:", {
      name: synagogueName,
      notifications: notificationsEnabled,
      autoSave,
    });
  };

  const handleDeleteSynagogue = () => {
    // TODO: Implement delete synagogue functionality
    console.log("Delete synagogue:", synagogueId);
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
          <Typography variant="h4">הגדרות בית כנסת</Typography>
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            העדפות
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
              />
            }
            label="התראות"
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={autoSave}
                onChange={e => setAutoSave(e.target.checked)}
              />
            }
            label="שמירה אוטומטית"
          />
        </CardContent>
      </Card>

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
            onClick={handleDeleteSynagogue}
          >
            מחק בית כנסת
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={handleBackClick}>
          ביטול
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          שמור הגדרות
        </Button>
      </Box>
    </Container>
  );
};

export default SynagogueSettingsPage;

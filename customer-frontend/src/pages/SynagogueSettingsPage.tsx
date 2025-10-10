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
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useUpdateSynagogue, useDeleteSynagogue } from "../hooks/useSynagogues";
import { useGabaim, useAddGabai, useRemoveGabai } from "../hooks/useGabaim";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

// Validation schemas
const synagogueNameSchema = Yup.object({
  name: Yup.string().required("שם בית הכנסת לא יכול להיות ריק"),
});

const gabaiEmailSchema = Yup.object({
  email: Yup.string()
    .email("כתובת אימייל לא תקינה")
    .required("נא להזין כתובת אימייל"),
});

const SynagogueSettingsPage: React.FC = () => {
  const { synagogueId } = useParams<{ synagogueId: string }>();
  const navigate = useSynagogueNavigate();
  const { data: synagogue, isLoading } = useSelectedSynagogue();
  const updateSynagogueMutation = useUpdateSynagogue();
  const deleteSynagogueMutation = useDeleteSynagogue();

  // Gabaim management
  const { data: gabaim, isLoading: isLoadingGabaim } = useGabaim();
  const addGabaiMutation = useAddGabai();
  const removeGabaiMutation = useRemoveGabai();

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddGabaiDialog, setShowAddGabaiDialog] = useState(false);
  const [showRemoveGabaiDialog, setShowRemoveGabaiDialog] = useState(false);
  const [gabaiToRemove, setGabaiToRemove] = useState<string | null>(null);

  const handleBackClick = () => {
    navigate(``);
  };

  const handleUpdateSynagogueName = async (values: { name: string }) => {
    if (!synagogue || !synagogueId) return;

    try {
      const updatedSynagogue = synagogue.update({ name: values.name.trim() });
      await updateSynagogueMutation.mutateAsync({
        id: synagogueId,
        synagogue: updatedSynagogue,
      });
    } catch (error) {
      console.error("Error saving synagogue:", error);
      throw error; // Let Formik handle the error
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

  const handleAddGabai = async (
    values: { email: string },
    { resetForm }: { resetForm: () => void }
  ) => {
    // Check if gabai already exists
    if (gabaim?.some(gabai => gabai.id === values.email.trim())) {
      alert("גבאי זה כבר קיים");
      return;
    }

    try {
      await addGabaiMutation.mutateAsync(values.email.trim());
      setShowAddGabaiDialog(false);
      resetForm();
    } catch (error) {
      console.error("Error adding gabai:", error);
      throw error; // Let Formik handle the error
    }
  };

  const handleOpenRemoveGabaiDialog = (email: string) => {
    setGabaiToRemove(email);
    setShowRemoveGabaiDialog(true);
  };

  const handleRemoveGabai = async () => {
    if (!gabaiToRemove) return;

    try {
      await removeGabaiMutation.mutateAsync(gabaiToRemove);
      setShowRemoveGabaiDialog(false);
      setGabaiToRemove(null);
    } catch (error) {
      console.error("Error removing gabai:", error);
      alert("שגיאה בהסרת גבאי");
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

      {/* Synagogue Name Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            מידע כללי
          </Typography>
          <Formik
            initialValues={{ name: synagogue?.name || "" }}
            validationSchema={synagogueNameSchema}
            onSubmit={handleUpdateSynagogueName}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
              dirty,
            }) => (
              <Form>
                <TextField
                  fullWidth
                  label="שם בית הכנסת"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{ mb: 2 }}
                />
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={16} />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    disabled={isSubmitting || !dirty}
                  >
                    {isSubmitting ? "שומר..." : "שמור שינויים"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
          {synagogue && (
            <Box sx={{ mt: 2 }}>
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

      {/* Gabaim Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">ניהול גבאים</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setShowAddGabaiDialog(true)}
              size="small"
            >
              הוסף גבאי
            </Button>
          </Box>

          {isLoadingGabaim ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : gabaim && gabaim.length > 0 ? (
            <List>
              {gabaim.map(gabai => (
                <ListItem
                  key={gabai.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenRemoveGabaiDialog(gabai.id)}
                      color="error"
                      disabled={removeGabaiMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemText
                    primary={gabai.id}
                    secondary="גבאי"
                    primaryTypographyProps={{ fontWeight: "medium" }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">אין גבאים רשומים</Alert>
          )}
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
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleteSynagogueMutation.isPending}
          >
            {deleteSynagogueMutation.isPending ? "מוחק..." : "מחק בית כנסת"}
          </Button>
        </CardContent>
      </Card>

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

      {/* Add Gabai Dialog */}
      <Dialog
        open={showAddGabaiDialog}
        onClose={() => setShowAddGabaiDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Formik
          initialValues={{ email: "" }}
          validationSchema={gabaiEmailSchema}
          onSubmit={handleAddGabai}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <DialogTitle>הוסף גבאי</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="כתובת אימייל"
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder="example@email.com"
                    autoFocus
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setShowAddGabaiDialog(false)}
                  disabled={isSubmitting}
                >
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? <CircularProgress size={16} /> : <AddIcon />
                  }
                >
                  {isSubmitting ? "מוסיף..." : "הוסף"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Remove Gabai Dialog */}
      <Dialog
        open={showRemoveGabaiDialog}
        onClose={() => {
          setShowRemoveGabaiDialog(false);
          setGabaiToRemove(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>הסר גבאי</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            האם אתה בטוח שברצונך להסיר את הגבאי "{gabaiToRemove}"?
          </Alert>
          <Typography>
            גבאי זה לא יוכל יותר לגשת לפונקציות ניהול של בית הכנסת.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowRemoveGabaiDialog(false);
              setGabaiToRemove(null);
            }}
            disabled={removeGabaiMutation.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleRemoveGabai}
            color="error"
            variant="contained"
            disabled={removeGabaiMutation.isPending}
            startIcon={
              removeGabaiMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {removeGabaiMutation.isPending ? "מסיר..." : "הסר"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SynagogueSettingsPage;

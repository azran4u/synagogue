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
  Stack,
  FormControlLabel,
  Switch,
  FormHelperText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useUpdateSynagogue, useDeleteSynagogue } from "../hooks/useSynagogues";
import { Synagogue } from "../model/Synagogue";
import { useGabaim, useAddGabai, useRemoveGabai } from "../hooks/useGabaim";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useAliyaGroups, useUpdateAliyaGroup } from "../hooks/useAliyaGroups";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { downloadAliyotBackup } from "../utils/backupAliyot";

// Validation schemas
const synagogueNameSchema = Yup.object({
  name: Yup.string().required("שם בית הכנסת לא יכול להיות ריק"),
});

const gabaiEmailSchema = Yup.object({
  email: Yup.string()
    .email("כתובת אימייל לא תקינה")
    .required("נא להזין כתובת אימייל"),
});

const colorSchema = Yup.object({
  primaryColor: Yup.string().matches(
    /^#[0-9A-Fa-f]{6}$/,
    "נא להזין צבע תקין בפורמט hex"
  ),
  secondaryColor: Yup.string().matches(
    /^#[0-9A-Fa-f]{6}$/,
    "נא להזין צבע תקין בפורמט hex"
  ),
  errorColor: Yup.string().matches(
    /^#[0-9A-Fa-f]{6}$/,
    "נא להזין צבע תקין בפורמט hex"
  ),
});

const donationTrackingSchema = Yup.object({
  donationTrackingEnabled: Yup.boolean().required(),
});

const SynagogueSettingsPage: React.FC = () => {
  const { synagogueId } = useParams<{ synagogueId: string }>();
  const navigate = useSynagogueNavigate();
  const queryClient = useQueryClient();
  const { data: synagogue, isLoading } = useSelectedSynagogue();
  const updateSynagogueMutation = useUpdateSynagogue();
  const deleteSynagogueMutation = useDeleteSynagogue();

  // Gabaim management
  const { data: gabaim, isLoading: isLoadingGabaim } = useGabaim();
  const addGabaiMutation = useAddGabai();
  const removeGabaiMutation = useRemoveGabai();

  // Data export
  const { data: prayerCards, isLoading: isLoadingPrayerCards } =
    useAllPrayerCards();
  const { data: aliyaGroups, isLoading: isLoadingAliyaGroups } =
    useAliyaGroups();
  const { data: aliyaTypes, isLoading: isLoadingAliyaTypes } = useAliyaTypes();

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddGabaiDialog, setShowAddGabaiDialog] = useState(false);
  const [showRemoveGabaiDialog, setShowRemoveGabaiDialog] = useState(false);
  const [gabaiToRemove, setGabaiToRemove] = useState<string | null>(null);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const updateAliyaGroupMutation = useUpdateAliyaGroup();

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

  const handleUpdateColors = async (values: {
    primaryColor: string;
    secondaryColor: string;
    errorColor: string;
  }) => {
    if (!synagogue || !synagogueId) return;

    try {
      const updatedSynagogue = synagogue.update({
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
        errorColor: values.errorColor,
      });
      await updateSynagogueMutation.mutateAsync({
        id: synagogueId,
        synagogue: updatedSynagogue,
      });
    } catch (error) {
      console.error("Error saving colors:", error);
      throw error; // Let Formik handle the error
    }
  };

  const handleResetColors = () => {
    return Synagogue.getDefaultColors();
  };

  const handleUpdateDonationTracking = async (values: {
    donationTrackingEnabled: boolean;
  }) => {
    if (!synagogue || !synagogueId) return;

    try {
      const updatedSynagogue = synagogue.update({
        donationTrackingEnabled: values.donationTrackingEnabled,
      });
      await updateSynagogueMutation.mutateAsync({
        id: synagogueId,
        synagogue: updatedSynagogue,
      });
    } catch (error) {
      console.error("Error saving donation tracking setting:", error);
      throw error; // Let Formik handle the error
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

      {/* Color Customization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            התאמת צבעים
          </Typography>

          <Formik
            initialValues={{
              primaryColor:
                synagogue?.primaryColorValue || Synagogue.DEFAULT_PRIMARY_COLOR,
              secondaryColor:
                synagogue?.secondaryColorValue ||
                Synagogue.DEFAULT_SECONDARY_COLOR,
              errorColor:
                synagogue?.errorColorValue || Synagogue.DEFAULT_ERROR_COLOR,
            }}
            validationSchema={colorSchema}
            onSubmit={handleUpdateColors}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting, dirty }) => (
              <Form>
                <Stack spacing={3}>
                  {/* Color Picker Fields */}
                  <Box>
                    <TextField
                      name="primaryColor"
                      label="צבע ראשי"
                      type="color"
                      value={values.primaryColor}
                      onChange={e =>
                        setFieldValue("primaryColor", e.target.value)
                      }
                      fullWidth
                      InputProps={{
                        style: { height: 56 },
                      }}
                      helperText="הצבע הראשי שמוצג בכפתורים ובאלמנטים עיקריים"
                    />
                  </Box>

                  <Box>
                    <TextField
                      name="secondaryColor"
                      label="צבע משני"
                      type="color"
                      value={values.secondaryColor}
                      onChange={e =>
                        setFieldValue("secondaryColor", e.target.value)
                      }
                      fullWidth
                      InputProps={{
                        style: { height: 56 },
                      }}
                      helperText="הצבע המשני שמוצג בכפתורים משניים ובאלמנטים תומכים"
                    />
                  </Box>

                  <Box>
                    <TextField
                      name="errorColor"
                      label="צבע שגיאה"
                      type="color"
                      value={values.errorColor}
                      onChange={e =>
                        setFieldValue("errorColor", e.target.value)
                      }
                      fullWidth
                      InputProps={{
                        style: { height: 56 },
                      }}
                      helperText="הצבע שמוצג בהודעות שגיאה ובאלמנטים בעלי חשיבות גבוהה"
                    />
                  </Box>

                  {/* Preview */}
                  <Card sx={{ bgcolor: "grey.100", p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      תצוגה מקדימה:
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: values.primaryColor,
                          "&:hover": {
                            backgroundColor: values.primaryColor,
                            opacity: 0.8,
                          },
                        }}
                      >
                        ראשי
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: values.secondaryColor,
                          "&:hover": {
                            backgroundColor: values.secondaryColor,
                            opacity: 0.8,
                          },
                        }}
                      >
                        משני
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: values.errorColor,
                          "&:hover": {
                            backgroundColor: values.errorColor,
                            opacity: 0.8,
                          },
                        }}
                      >
                        שגיאה
                      </Button>
                    </Stack>
                  </Card>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        const defaultColors = handleResetColors();
                        setFieldValue(
                          "primaryColor",
                          defaultColors.primaryColor
                        );
                        setFieldValue(
                          "secondaryColor",
                          defaultColors.secondaryColor
                        );
                        setFieldValue("errorColor", defaultColors.errorColor);
                      }}
                    >
                      איפוס לברירת מחדל
                    </Button>
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
                      {isSubmitting ? "שומר..." : "שמור צבעים"}
                    </Button>
                  </Box>
                </Stack>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Donation Tracking Feature Toggle */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            תכונות מתקדמות
          </Typography>

          <Formik
            initialValues={{
              donationTrackingEnabled:
                synagogue?.isDonationTrackingEnabled || false,
            }}
            validationSchema={donationTrackingSchema}
            onSubmit={handleUpdateDonationTracking}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting, dirty }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.donationTrackingEnabled}
                        onChange={e =>
                          setFieldValue(
                            "donationTrackingEnabled",
                            e.target.checked
                          )
                        }
                        name="donationTrackingEnabled"
                        color="primary"
                      />
                    }
                    label="אפשר מעקב אחר תרומות וחובות מתפללים"
                  />
                  <FormHelperText>
                    מאפשר לגבאים לנהל תרומות וחובות של מתפללים. המתפללים יוכלו
                    לראות את החובות שלהם.
                  </FormHelperText>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
                    {isSubmitting ? "שומר..." : "שמור הגדרות תרומות"}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ייצוא נתונים
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ייצא את כל נתוני העליות לבית הכנסת כקובץ JSON. הקובץ יכלול את כל
            העליות, המתפללים, הקבוצות והתאריכים.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (
                synagogue &&
                prayerCards &&
                aliyaGroups &&
                aliyaTypes &&
                !isLoadingPrayerCards &&
                !isLoadingAliyaGroups &&
                !isLoadingAliyaTypes
              ) {
                downloadAliyotBackup(
                  prayerCards,
                  aliyaGroups,
                  aliyaTypes,
                  synagogue.id,
                  synagogue.name
                );
              }
            }}
            disabled={
              !synagogue ||
              !prayerCards ||
              !aliyaGroups ||
              !aliyaTypes ||
              isLoadingPrayerCards ||
              isLoadingAliyaGroups ||
              isLoadingAliyaTypes
            }
          >
            ייצא נתוני עליות
          </Button>
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

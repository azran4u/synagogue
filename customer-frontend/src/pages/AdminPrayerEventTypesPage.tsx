import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { PrayerEventType } from "../model/PrayerEventType";
import {
  usePrayerEventTypes,
  useCreatePrayerEventType,
  useUpdatePrayerEventType,
  useDeletePrayerEventType,
} from "../hooks/usePrayerEventTypes";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface PrayerEventTypeFormValues {
  displayName: string;
  recurrenceType: "none" | "yearly";
  enabled: boolean;
  description: string;
  displayOrder: number;
}

const validationSchema = Yup.object({
  displayName: Yup.string()
    .required("שם האירוע נדרש")
    .min(2, "שם האירוע חייב להכיל לפחות 2 תווים"),
  recurrenceType: Yup.string()
    .oneOf(["none", "yearly"], "סוג החזרה חייב להיות 'חד פעמי' או 'שנתי'")
    .required("סוג החזרה נדרש"),
  enabled: Yup.boolean().required(),
  description: Yup.string().optional(),
  displayOrder: Yup.number()
    .integer("סדר התצוגה חייב להיות מספר שלם")
    .min(0, "סדר התצוגה חייב להיות מספר חיובי")
    .required("סדר התצוגה נדרש"),
});

const AdminPrayerEventTypesContent = () => {
  const navigate = useSynagogueNavigate();
  const isAdmin = useIsAdmin();

  // State for dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEventType, setEditingEventType] =
    useState<PrayerEventType | null>(null);

  // Data fetching
  const { data: prayerEventTypes, isLoading, error } = usePrayerEventTypes();

  // Mutations
  const createMutation = useCreatePrayerEventType(() => {
    setShowCreateDialog(false);
  });

  const updateMutation = useUpdatePrayerEventType(() => {
    setShowEditDialog(false);
    setEditingEventType(null);
  });

  const deleteMutation = useDeletePrayerEventType();

  // Initial form values
  const initialFormValues: PrayerEventTypeFormValues = {
    displayName: "",
    recurrenceType: "none",
    enabled: true,
    description: "",
    displayOrder: 0,
  };

  const handleCreate = async (
    values: PrayerEventTypeFormValues,
    { setSubmitting }: FormikHelpers<PrayerEventTypeFormValues>
  ) => {
    try {
      await createMutation.mutateAsync(
        PrayerEventType.create(
          values.displayName,
          values.recurrenceType,
          values.description,
          values.displayOrder
        )
      );
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating prayer event type:", error);
      setSubmitting(false);
    }
  };

  const handleEdit = (eventType: PrayerEventType) => {
    setEditingEventType(eventType);
    setShowEditDialog(true);
  };

  const handleUpdate = async (
    values: PrayerEventTypeFormValues,
    { setSubmitting }: FormikHelpers<PrayerEventTypeFormValues>
  ) => {
    if (!editingEventType) return;

    try {
      const updatedEventType = editingEventType.update({
        displayName: values.displayName,
        recurrenceType: values.recurrenceType,
        enabled: values.enabled,
        description: values.description || undefined,
        displayOrder: values.displayOrder,
      });

      await updateMutation.mutateAsync(updatedEventType);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating prayer event type:", error);
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את סוג האירוע הזה?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting prayer event type:", error);
      }
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  // Check if user is admin
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          אין לך הרשאות לגשת לעמוד זה
        </Alert>
        <Button variant="outlined" onClick={handleBackToHome}>
          חזור לדף הבית
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          שגיאה בטעינת סוגי האירועים
        </Alert>
        <Button variant="outlined" onClick={handleBackToHome}>
          חזור לדף הבית
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: { xs: "center", sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textAlign: "center",
            order: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <SettingsIcon />
          ניהול סוגי אירועים
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 2 },
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{
              mr: { xs: 1, sm: 2 },
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            הוסף סוג אירוע
          </Button>
          <Button
            variant="outlined"
            onClick={handleBackToHome}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            חזור לדף הבית
          </Button>
        </Box>
      </Box>

      {/* Prayer Event Types List */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {prayerEventTypes?.map(eventType => (
          <Card key={eventType.id}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventIcon color="primary" />
                  <Typography variant="h6" component="div">
                    {eventType.displayName}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(eventType)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(eventType.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Stack spacing={1}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={eventType.recurrenceTypeDescription}
                    size="small"
                    color={eventType.isRecurring ? "primary" : "default"}
                  />
                  <Chip
                    label={eventType.enabled ? "פעיל" : "לא פעיל"}
                    size="small"
                    color={eventType.enabled ? "success" : "error"}
                  />
                </Box>

                {eventType.description && (
                  <Typography variant="body2" color="text.secondary">
                    {eventType.description}
                  </Typography>
                )}

                <Typography variant="body2" color="text.secondary">
                  סדר תצוגה: {eventType.displayOrder || 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>הוסף סוג אירוע</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialFormValues}
            validationSchema={validationSchema}
            onSubmit={handleCreate}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    name="displayName"
                    label="שם האירוע"
                    value={values.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.displayName && Boolean(errors.displayName)}
                    helperText={touched.displayName && errors.displayName}
                    required
                    fullWidth
                  />

                  <FormControl fullWidth>
                    <InputLabel>סוג החזרה</InputLabel>
                    <Select
                      name="recurrenceType"
                      value={values.recurrenceType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.recurrenceType && Boolean(errors.recurrenceType)
                      }
                    >
                      <MenuItem value="none">חד פעמי</MenuItem>
                      <MenuItem value="yearly">שנתי</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    name="description"
                    label="תיאור (אופציונלי)"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    multiline
                    rows={3}
                    fullWidth
                  />

                  <TextField
                    name="displayOrder"
                    label="סדר תצוגה"
                    type="number"
                    value={values.displayOrder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.displayOrder && Boolean(errors.displayOrder)}
                    helperText={touched.displayOrder && errors.displayOrder}
                    required
                    fullWidth
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.enabled}
                        onChange={e =>
                          setFieldValue("enabled", e.target.checked)
                        }
                        name="enabled"
                      />
                    }
                    label="פעיל"
                  />
                </Stack>
                <DialogActions>
                  <Button
                    type="button"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || createMutation.isPending}
                  >
                    {createMutation.isPending ? "יוצר..." : "צור"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>ערוך סוג אירוע</DialogTitle>
        <DialogContent>
          {editingEventType && (
            <Formik
              initialValues={{
                displayName: editingEventType.displayName,
                recurrenceType: editingEventType.recurrenceType,
                enabled: editingEventType.enabled,
                description: editingEventType.description || "",
                displayOrder: editingEventType.displayOrder || 0,
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdate}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                      name="displayName"
                      label="שם האירוע"
                      value={values.displayName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.displayName && Boolean(errors.displayName)}
                      helperText={touched.displayName && errors.displayName}
                      required
                      fullWidth
                    />

                    <FormControl fullWidth>
                      <InputLabel>סוג החזרה</InputLabel>
                      <Select
                        name="recurrenceType"
                        value={values.recurrenceType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.recurrenceType &&
                          Boolean(errors.recurrenceType)
                        }
                      >
                        <MenuItem value="none">חד פעמי</MenuItem>
                        <MenuItem value="yearly">שנתי</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      name="description"
                      label="תיאור (אופציונלי)"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      multiline
                      rows={3}
                      fullWidth
                    />

                    <TextField
                      name="displayOrder"
                      label="סדר תצוגה"
                      type="number"
                      value={values.displayOrder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.displayOrder && Boolean(errors.displayOrder)
                      }
                      helperText={touched.displayOrder && errors.displayOrder}
                      required
                      fullWidth
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.enabled}
                          onChange={e =>
                            setFieldValue("enabled", e.target.checked)
                          }
                          name="enabled"
                        />
                      }
                      label="פעיל"
                    />
                  </Stack>
                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowEditDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "שומר..." : "שמור"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminPrayerEventTypesContent;

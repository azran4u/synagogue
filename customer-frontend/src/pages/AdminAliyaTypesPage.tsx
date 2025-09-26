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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { AliyaType } from "../model/AliyaType";
import {
  useAliyaTypes,
  useCreateAliyaType,
  useDeleteAliyaType,
  useUpdateAliyaType,
} from "../hooks/useAliyaTypes";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface AliyaTypeFormValues {
  displayName: string;
  weight: number;
  enabled: boolean;
  description: string;
  displayOrder: number;
}

const validationSchema = Yup.object({
  displayName: Yup.string()
    .required("שם העלייה נדרש")
    .min(2, "שם העלייה חייב להכיל לפחות 2 תווים"),
  weight: Yup.number()
    .integer("משקל חייב להיות מספר שלם")
    .min(1, "משקל חייב להיות לפחות 1")
    .max(10, "משקל חייב להיות לכל היותר 10")
    .required("משקל נדרש"),
  enabled: Yup.boolean().required(),
  description: Yup.string().optional(),
  displayOrder: Yup.number()
    .integer("סדר התצוגה חייב להיות מספר שלם")
    .min(0, "סדר התצוגה חייב להיות מספר חיובי")
    .required("סדר התצוגה נדרש"),
});

const AdminAliyaTypesContent = () => {
  const navigate = useSynagogueNavigate();
  const isAdmin = useIsAdmin();

  // State for dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAliyaType, setEditingAliyaType] = useState<AliyaType | null>(
    null
  );

  // Data fetching
  const { data: aliyaTypes, isLoading, error } = useAliyaTypes();

  // Mutations
  const createMutation = useCreateAliyaType();
  const updateMutation = useUpdateAliyaType();
  const deleteMutation = useDeleteAliyaType();

  // Initial form values
  const initialFormValues: AliyaTypeFormValues = {
    displayName: "",
    weight: 1,
    enabled: true,
    description: "",
    displayOrder: 0,
  };

  // Handlers
  const handleCreateAliyaType = async (
    values: AliyaTypeFormValues,
    { setSubmitting }: FormikHelpers<AliyaTypeFormValues>
  ) => {
    try {
      const newAliyaType = AliyaType.create(
        values.displayName,
        values.weight,
        values.description || undefined,
        values.displayOrder
      );

      // Set enabled state
      const aliyaTypeWithState = values.enabled
        ? newAliyaType.enable()
        : newAliyaType.disable();

      await createMutation.mutateAsync(aliyaTypeWithState);
      setShowCreateDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya type:", error);
      setSubmitting(false);
    }
  };

  const handleUpdateAliyaType = async (
    values: AliyaTypeFormValues,
    { setSubmitting }: FormikHelpers<AliyaTypeFormValues>
  ) => {
    if (!editingAliyaType) return;

    try {
      const updatedAliyaType = editingAliyaType.update({
        displayName: values.displayName,
        weight: values.weight,
        enabled: values.enabled,
        description: values.description || undefined,
        displayOrder: values.displayOrder,
      });

      await updateMutation.mutateAsync(updatedAliyaType);
      setShowEditDialog(false);
      setEditingAliyaType(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating aliya type:", error);
      setSubmitting(false);
    }
  };

  const handleDeleteAliyaType = async (aliyaType: AliyaType) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את "${aliyaType.displayName}"?`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(aliyaType.id);
      } catch (error) {
        console.error("Error deleting aliya type:", error);
      }
    }
  };

  const handleEditAliyaType = (aliyaType: AliyaType) => {
    setEditingAliyaType(aliyaType);
    setShowEditDialog(true);
  };

  const handleBackToHome = () => {
    navigate("");
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          אין לך הרשאות גישה לדף זה. רק מנהלים יכולים לגשת לניהול סוגי עליות.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען סוגי עליות...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          שגיאה בטעינת סוגי העליות. אנא נסה שוב מאוחר יותר.
        </Alert>
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
          component="h1"
          sx={{
            textAlign: "center",
            order: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          ניהול סוגי עליות
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 2 },
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            הוסף סוג עלייה
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
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

      {/* Aliya Types Grid */}
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
        {aliyaTypes
          ?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map(aliyaType => (
            <Card key={aliyaType.id} variant="outlined">
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2">
                    {aliyaType.displayName}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditAliyaType(aliyaType)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAliyaType(aliyaType)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      משקל:
                    </Typography>
                    <Chip
                      label={aliyaType.weight}
                      size="small"
                      color={
                        aliyaType.isHighPriority
                          ? "error"
                          : aliyaType.isMediumPriority
                            ? "warning"
                            : "default"
                      }
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      סטטוס:
                    </Typography>
                    <Chip
                      label={aliyaType.enabled ? "פעיל" : "לא פעיל"}
                      size="small"
                      color={aliyaType.enabled ? "success" : "default"}
                      variant={aliyaType.enabled ? "filled" : "outlined"}
                    />
                  </Box>

                  {aliyaType.description && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        תיאור:
                      </Typography>
                      <Typography variant="body2">
                        {aliyaType.description}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      סדר תצוגה:
                    </Typography>
                    <Typography variant="body2">
                      {aliyaType.displayOrder || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      עדיפות:
                    </Typography>
                    <Chip
                      label={aliyaType.priorityDescription}
                      size="small"
                      color={
                        aliyaType.isHighPriority
                          ? "error"
                          : aliyaType.isMediumPriority
                            ? "warning"
                            : "default"
                      }
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Box>

      {/* Create Aliya Type Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>הוסף סוג עלייה חדש</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialFormValues}
            validationSchema={validationSchema}
            onSubmit={handleCreateAliyaType}
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
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    name="displayName"
                    label="שם העלייה"
                    value={values.displayName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.displayName && Boolean(errors.displayName)}
                    helperText={touched.displayName && errors.displayName}
                    required
                    fullWidth
                  />

                  <TextField
                    name="weight"
                    label="משקל (1-10)"
                    type="number"
                    value={values.weight}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.weight && Boolean(errors.weight)}
                    helperText={touched.weight && errors.weight}
                    required
                    fullWidth
                    inputProps={{ min: 1, max: 10 }}
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
                    inputProps={{ min: 0 }}
                  />

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

                  <FormControlLabel
                    control={
                      <Switch
                        name="enabled"
                        checked={values.enabled}
                        onChange={handleChange}
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
                    {createMutation.isPending ? "יוצר..." : "צור סוג עלייה"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Edit Aliya Type Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ערוך סוג עלייה</DialogTitle>
        <DialogContent>
          {editingAliyaType && (
            <Formik
              initialValues={{
                displayName: editingAliyaType.displayName,
                weight: editingAliyaType.weight,
                enabled: editingAliyaType.enabled,
                description: editingAliyaType.description || "",
                displayOrder: editingAliyaType.displayOrder || 0,
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdateAliyaType}
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
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                      name="displayName"
                      label="שם העלייה"
                      value={values.displayName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.displayName && Boolean(errors.displayName)}
                      helperText={touched.displayName && errors.displayName}
                      required
                      fullWidth
                    />

                    <TextField
                      name="weight"
                      label="משקל (1-10)"
                      type="number"
                      value={values.weight}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.weight && Boolean(errors.weight)}
                      helperText={touched.weight && errors.weight}
                      required
                      fullWidth
                      inputProps={{ min: 1, max: 10 }}
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
                      inputProps={{ min: 0 }}
                    />

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

                    <FormControlLabel
                      control={
                        <Switch
                          name="enabled"
                          checked={values.enabled}
                          onChange={handleChange}
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
                      {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
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

const AdminAliyaTypesPage: React.FC = () => {
  return <AdminAliyaTypesContent />;
};

export default AdminAliyaTypesPage;

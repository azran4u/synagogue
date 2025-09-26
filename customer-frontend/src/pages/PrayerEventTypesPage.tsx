import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { PrayerEventType } from "../model/PrayerEventType";
import {
  useCreatePrayerEventType,
  useDeletePrayerEventType,
  usePrayerEventTypes,
} from "../hooks/usePrayerEventTypes";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { useUpdatePrayerEventType } from "../hooks/usePrayerEventTypes";

interface FormValues {
  displayName: string;
  recurrenceType: "none" | "yearly";
  enabled: boolean;
  description: string;
  displayOrder: number;
}

const initialValues: FormValues = {
  displayName: "",
  recurrenceType: "none",
  enabled: true,
  description: "",
  displayOrder: 1,
};

const PrayerEventTypesPage: React.FC = () => {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  const navigate = useNavigate();

  const { data: prayerEventTypes, isLoading } = usePrayerEventTypes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<PrayerEventType | null>(null);
  const handleOpenDialog = (type?: PrayerEventType) => {
    setEditingType(type || null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
  };

  const createMutation = useCreatePrayerEventType(handleCloseDialog);
  const updateMutation = useUpdatePrayerEventType(handleCloseDialog);
  const deleteMutation = useDeletePrayerEventType(handleCloseDialog);

  const handleBackClick = () => {
    navigate(`/synagogue/${synagogueId}`);
  };

  const handleSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    if (editingType) {
      updateMutation.mutate(
        editingType.update({
          displayName: values.displayName,
          recurrenceType: values.recurrenceType,
          description: values.description,
          displayOrder: values.displayOrder,
          enabled: values.enabled,
        })
      );
    } else {
      createMutation.mutate(
        PrayerEventType.create(
          values.displayName,
          values.recurrenceType,
          values.description,
          values.displayOrder
        )
      );
    }
    setSubmitting(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את סוג האירוע?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>טוען סוגי אירועים...</Typography>
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
          <Typography variant="h4">ניהול סוגי אירועים</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף סוג אירוע
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            רשימת סוגי אירועים
          </Typography>

          {prayerEventTypes?.length === 0 ? (
            <Alert severity="info">
              אין סוגי אירועים זמינים. לחץ על "הוסף סוג אירוע" כדי להתחיל.
            </Alert>
          ) : (
            <List>
              {prayerEventTypes?.map((type, index) => (
                <ListItem
                  key={type.id}
                  divider={index < prayerEventTypes.length - 1}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="h6">{type.displayName}</Typography>
                        {type.enabled ? (
                          <Chip label="פעיל" color="success" size="small" />
                        ) : (
                          <Chip label="לא פעיל" color="default" size="small" />
                        )}
                        <Chip
                          label={type.recurrenceTypeDescription}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box
                        component="span"
                        display="block"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {type.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                            display="block"
                          >
                            תיאור: {type.description}
                          </Typography>
                        )}
                        {type.displayOrder !== undefined && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                            display="block"
                          >
                            סדר תצוגה: {type.displayOrder}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(type)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(type.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingType ? "ערוך סוג אירוע" : "הוסף סוג אירוע חדש"}
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={
              editingType
                ? {
                    displayName: editingType.displayName,
                    recurrenceType: editingType.recurrenceType,
                    enabled: editingType.enabled,
                    description: editingType.description || "",
                    displayOrder: editingType.displayOrder || 0,
                  }
                : initialValues
            }
            onSubmit={handleSubmit}
          >
            {({
              values,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form>
                <Box sx={{ pt: 2 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        fullWidth
                        name="displayName"
                        label="שם תצוגה"
                        value={values.displayName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText="השם שיוצג למשתמש"
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>סוג חזרה</InputLabel>
                        <Select
                          name="recurrenceType"
                          value={values.recurrenceType}
                          label="סוג חזרה"
                          onChange={handleChange}
                        >
                          <MenuItem value="none">חד פעמי</MenuItem>
                          <MenuItem value="yearly">שנתי</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        name="displayOrder"
                        label="סדר תצוגה"
                        type="number"
                        value={values.displayOrder}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        helperText="מספר לקביעת סדר התצוגה"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      name="description"
                      multiline
                      label="תיאור"
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      helperText="תיאור אופציונלי לסוג האירוע"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          name="enabled"
                          checked={values.enabled}
                          onChange={e =>
                            setFieldValue("enabled", e.target.checked)
                          }
                        />
                      }
                      label="פעיל"
                    />
                  </Box>
                </Box>
                <DialogActions>
                  <Button type="button" onClick={handleCloseDialog}>
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={
                      isSubmitting ||
                      createMutation.isPending ||
                      updateMutation.isPending
                    }
                  >
                    {editingType ? "עדכן" : "הוסף"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PrayerEventTypesPage;

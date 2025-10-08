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
  Stack,
  IconButton,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { FormikHelpers } from "formik";
import { PrayerTimes, PrayerTimeSectionEntry } from "../model/PrayerTimes";
import {
  usePrayerTimes,
  useCreatePrayerTimes,
  useUpdatePrayerTimes,
  useDeletePrayerTimes,
} from "../hooks/usePrayerTimes";
import { useUser } from "../hooks/useUser";
import { WithLogin } from "../components/WithLogin";
import {
  PrayerTimesForm,
  PrayerTimesFormValues,
} from "../components/PrayerTimesForm";

const AdminPrayerTimesContent: React.FC = () => {
  const { isGabaiOrHigher } = useUser();
  const { data: prayerTimesList, isLoading, error } = usePrayerTimes();
  const createMutation = useCreatePrayerTimes();
  const updateMutation = useUpdatePrayerTimes();
  const deleteMutation = useDeletePrayerTimes();

  const [showDialog, setShowDialog] = useState(false);
  const [editingPrayerTimes, setEditingPrayerTimes] =
    useState<PrayerTimes | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingPrayerTimes(null);
    setShowDialog(true);
  };

  const handleEdit = (prayerTimes: PrayerTimes) => {
    setEditingPrayerTimes(prayerTimes);
    setShowDialog(true);
  };

  const handleDelete = async (prayerTimes: PrayerTimes) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את לוח הזמנים "${prayerTimes.title}"?`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(prayerTimes.id);
      } catch (error) {
        console.error("Error deleting prayer times:", error);
      }
    }
  };

  const handleSubmit = async (
    values: PrayerTimesFormValues,
    helpers: FormikHelpers<PrayerTimesFormValues>
  ) => {
    try {
      const sectionsData: PrayerTimeSectionEntry[] = values.sections.map(
        section => ({
          title: section.title,
          displayOrder: section.displayOrder,
          enabled: section.enabled,
          notes: section.notes || undefined,
          times: section.times.map(time => ({
            title: time.title,
            hour: time.hour || undefined,
            displayOrder: time.displayOrder,
            enabled: time.enabled,
            notes: time.notes || undefined,
          })),
        })
      );

      if (editingPrayerTimes) {
        // Update existing
        const updated = editingPrayerTimes.update({
          title: values.title,
          displayOrder: values.displayOrder,
          enabled: values.enabled,
          notes: values.notes || undefined,
          sections: sectionsData,
        });
        await updateMutation.mutateAsync(updated);
      } else {
        // Create new
        const newPrayerTimes = PrayerTimes.create(
          values.title,
          values.displayOrder,
          values.notes || undefined,
          sectionsData
        );
        await createMutation.mutateAsync(newPrayerTimes);
      }

      setShowDialog(false);
      setEditingPrayerTimes(null);
    } catch (error) {
      console.error("Error saving prayer times:", error);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingPrayerTimes(null);
  };

  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          אין לך הרשאות גישה לדף זה. רק גבאים ומנהלים יכולים לערוך זמני תפילות.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען זמני תפילות...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת זמני תפילות: {error.message}
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
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          ניהול זמני תפילות
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          הוסף לוח זמנים
        </Button>
      </Box>

      {/* Prayer Times List */}
      {!prayerTimesList || prayerTimesList.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <TimeIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין לוחות זמנים
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              לחץ על "הוסף לוח זמנים" כדי ליצור לוח ראשון
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {prayerTimesList
            .sort(
              (a: PrayerTimes, b: PrayerTimes) =>
                a.displayOrder - b.displayOrder
            )
            .map((prayerTimes: PrayerTimes) => (
              <Card key={prayerTimes.id} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography variant="h5">
                          {prayerTimes.title}
                        </Typography>
                        <Chip
                          label={prayerTimes.enabled ? "פעיל" : "לא פעיל"}
                          color={prayerTimes.enabled ? "success" : "default"}
                          size="small"
                        />
                        <Chip
                          label={`סדר: ${prayerTimes.displayOrder}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {prayerTimes.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {prayerTimes.notes}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="ערוך">
                        <IconButton
                          onClick={() => handleEdit(prayerTimes)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton
                          onClick={() => handleDelete(prayerTimes)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Sections */}
                  <Stack spacing={1}>
                    {prayerTimes.sections
                      .sort(
                        (
                          a: PrayerTimeSectionEntry,
                          b: PrayerTimeSectionEntry
                        ) => a.displayOrder - b.displayOrder
                      )
                      .map(
                        (
                          section: PrayerTimeSectionEntry,
                          sectionIndex: number
                        ) => (
                          <Accordion
                            key={sectionIndex}
                            expanded={
                              expandedId ===
                              `${prayerTimes.id}-section-${sectionIndex}`
                            }
                            onChange={() =>
                              setExpandedId(
                                expandedId ===
                                  `${prayerTimes.id}-section-${sectionIndex}`
                                  ? null
                                  : `${prayerTimes.id}-section-${sectionIndex}`
                              )
                            }
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  width: "100%",
                                }}
                              >
                                <Typography variant="h6">
                                  {section.title}
                                </Typography>
                                <Chip
                                  label={`${section.times.length} זמנים`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {!section.enabled && (
                                  <Chip
                                    label="לא פעיל"
                                    size="small"
                                    color="default"
                                  />
                                )}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={1}>
                                {section.times
                                  .sort(
                                    (a: any, b: any) =>
                                      a.displayOrder - b.displayOrder
                                  )
                                  .map((time: any, timeIndex: number) => (
                                    <Box
                                      key={timeIndex}
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 1,
                                        bgcolor: "background.default",
                                        borderRadius: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                        }}
                                      >
                                        <TimeIcon fontSize="small" />
                                        <Typography variant="body1">
                                          {time.title}
                                        </Typography>
                                        <Typography
                                          variant="h6"
                                          color="primary.main"
                                        >
                                          {time.hour}
                                        </Typography>
                                        {!time.enabled && (
                                          <Chip
                                            label="לא פעיל"
                                            size="small"
                                            color="default"
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  ))}
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        )
                      )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPrayerTimes ? "ערוך לוח זמנים" : "הוסף לוח זמנים חדש"}
        </DialogTitle>
        <DialogContent>
          <PrayerTimesForm
            prayerTimes={editingPrayerTimes}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default () => {
  return (
    <WithLogin>
      <AdminPrayerTimesContent />
    </WithLogin>
  );
};

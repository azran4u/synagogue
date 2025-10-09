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
  Book as BookIcon,
} from "@mui/icons-material";
import {
  useToraLessons,
  useCreateToraLesson,
  useUpdateToraLesson,
  useDeleteToraLesson,
} from "../hooks/useToraLessons";
import { useUser } from "../hooks/useUser";
import { ToraLesson } from "../model/ToraLessons";
import ToraLessonsForm from "../components/ToraLessonsForm";
import { WithLogin } from "../components/WithLogin";

interface ToraLessonFormValues {
  title: string;
  ledBy: string;
  when: string;
  displayOrder: number;
  enabled: boolean;
  notes: string;
}

const AdminToraLessonsContent: React.FC = () => {
  const { data: lessons, isLoading, error } = useToraLessons();
  const createLesson = useCreateToraLesson();
  const updateLesson = useUpdateToraLesson();
  const deleteLesson = useDeleteToraLesson();
  const { isGabaiOrHigher } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ToraLesson | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<ToraLesson | null>(null);

  // Check permissions
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  const handleOpenDialog = (lesson?: ToraLesson) => {
    setEditingLesson(lesson || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLesson(null);
  };

  const handleSubmit = async (values: ToraLessonFormValues) => {
    try {
      if (editingLesson) {
        // Update existing lesson
        const updatedLesson = editingLesson.update(values);
        await updateLesson.mutateAsync(updatedLesson);
      } else {
        // Create new lesson
        const newLesson = ToraLesson.create(
          values.title,
          values.ledBy,
          values.when,
          values.displayOrder,
          values.notes
        );
        // Set enabled status
        const lessonToSave = values.enabled ? newLesson : newLesson.disable();
        await createLesson.mutateAsync(lessonToSave);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save Torah lesson:", error);
    }
  };

  const handleOpenDeleteDialog = (lesson: ToraLesson) => {
    setLessonToDelete(lesson);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (lessonToDelete) {
      try {
        await deleteLesson.mutateAsync(lessonToDelete.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Failed to delete Torah lesson:", error);
      }
    }
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
          שגיאה בטעינת שיעורי תורה: {error.message}
        </Alert>
      </Box>
    );
  }

  const sortedLessons = lessons
    ? [...lessons].sort((a, b) => a.displayOrder - b.displayOrder)
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
        <Typography variant="h4">ניהול שיעורי תורה</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף שיעור
        </Button>
      </Box>

      {/* Lessons List */}
      {sortedLessons.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <BookIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין שיעורי תורה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הוסף שיעור תורה ראשון
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sortedLessons.map(lesson => (
            <Card key={lesson.id} elevation={2}>
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
                      <Typography variant="h6">{lesson.title}</Typography>
                      <Chip
                        label={lesson.enabled ? "פעיל" : "לא פעיל"}
                        color={lesson.enabled ? "success" : "default"}
                        size="small"
                      />
                      <Chip
                        label={`סדר: ${lesson.displayOrder}`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>מעביר השיעור:</strong> {lesson.ledBy}
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>מועד:</strong> {lesson.when}
                    </Typography>

                    {lesson.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, fontStyle: "italic" }}
                      >
                        {lesson.notes}
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="ערוך">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(lesson)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(lesson)}
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingLesson ? "ערוך שיעור תורה" : "הוסף שיעור תורה"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <ToraLessonsForm
              toraLesson={editingLesson}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={createLesson.isPending || updateLesson.isPending}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>מחק שיעור תורה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את השיעור "{lessonToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteLesson.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLesson.isPending}
            startIcon={
              deleteLesson.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteLesson.isPending ? "מוחק..." : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AdminToraLessonsPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminToraLessonsContent />
    </WithLogin>
  );
};

export default AdminToraLessonsPage;

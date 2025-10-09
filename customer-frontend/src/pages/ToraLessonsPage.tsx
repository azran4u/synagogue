import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import {
  Book as BookIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useEnabledToraLessons } from "../hooks/useToraLessons";
import { ToraLesson } from "../model/ToraLessons";

const ToraLessonsPage: React.FC = () => {
  const { data: lessons, isLoading, error } = useEnabledToraLessons();

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען שיעורי תורה...
        </Typography>
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
    ? [...lessons].sort(
        (a: ToraLesson, b: ToraLesson) => a.displayOrder - b.displayOrder
      )
    : [];

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: 4 }}
      >
        שיעורי תורה
      </Typography>

      {/* Lessons List */}
      {sortedLessons.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <BookIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין שיעורי תורה זמינים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              שיעורי התורה יתפרסמו בקרוב
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {sortedLessons.map((lesson: ToraLesson) => (
            <Card key={lesson.id} elevation={3}>
              <CardContent>
                {/* Lesson Title */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <BookIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    {lesson.title}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Lesson Details */}
                <Stack spacing={2}>
                  {/* Led By */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        מעביר השיעור
                      </Typography>
                      <Typography variant="h6">{lesson.ledBy}</Typography>
                    </Box>
                  </Box>

                  {/* When */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TimeIcon color="action" />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        מועד השיעור
                      </Typography>
                      <Typography variant="h6">{lesson.when}</Typography>
                    </Box>
                  </Box>

                  {/* Notes */}
                  {lesson.notes && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "pre-line" }}
                      >
                        {lesson.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ToraLessonsPage;

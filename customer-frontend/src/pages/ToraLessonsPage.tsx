import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Note as NoteIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { ToraLessonsCollection } from "../model/ToraLessons";
import { useToraLessons } from "../hooks/useToraLessons";
import { HebrewDate } from "../model/HebrewDate";

const ToraLessonsPage: React.FC = () => {
  const { data: collections, isLoading, error } = useToraLessons();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          שגיאה בטעינת שיעורי תורה: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom align="center">
          שיעורי תורה
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          אין שיעורי תורה זמינים כרגע
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          שיעורי תורה
        </Typography>
      </Box>

      {/* Collections List */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={3}
      >
        {collections.map((collection: ToraLessonsCollection) => (
          <Card
            elevation={3}
            key={collection.id}
            sx={{ height: "fit-content" }}
          >
            <CardContent>
              {/* Collection Header */}
              <Box mb={2}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {collection.title}
                </Typography>
                {collection.description && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {collection.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  עודכן: {new HebrewDate(collection.updatedAt).toString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Lessons Count */}
              <Box mb={2}>
                <Chip
                  icon={<BookIcon />}
                  label={`${collection.lessons.length} שיעורים`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              {/* Lessons */}
              {collection.lessons.length > 0 ? (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        רשימת השיעורים
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {collection.lessons.map((lesson, index) => (
                        <ListItem
                          key={lesson.id}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            mb: 1,
                            backgroundColor: lesson.isWeekly
                              ? "primary.50"
                              : "secondary.50",
                            flexDirection: "column",
                            alignItems: "stretch",
                          }}
                        >
                          <Box sx={{ width: "100%" }}>
                            <Box display="flex" alignItems="flex-start">
                              <ListItemIcon>
                                <EventIcon
                                  color={
                                    lesson.isWeekly ? "primary" : "secondary"
                                  }
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight="bold"
                                    >
                                      {lesson.title}
                                    </Typography>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                      mt={0.5}
                                    >
                                      <Chip
                                        size="small"
                                        label={lesson.typeDescription}
                                        color={
                                          lesson.isWeekly
                                            ? "primary"
                                            : "secondary"
                                        }
                                        variant="outlined"
                                      />
                                      {lesson.hasTime && (
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          gap={0.5}
                                        >
                                          <TimeIcon fontSize="small" />
                                          <Typography variant="caption">
                                            {lesson.formattedTime}
                                          </Typography>
                                        </Box>
                                      )}
                                      {lesson.hasDayOfWeek && (
                                        <Typography variant="caption">
                                          {lesson.dayOfWeekName}
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                }
                              />
                            </Box>

                            <Box sx={{ mt: 1, ml: 2 }}>
                              {lesson.ledBy && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                  mb={0.5}
                                >
                                  <PersonIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {lesson.ledBy}
                                  </Typography>
                                </Box>
                              )}
                              {lesson.topic && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                  mb={0.5}
                                >
                                  <BookIcon fontSize="small" />
                                  <Typography variant="caption">
                                    {lesson.topic}
                                  </Typography>
                                </Box>
                              )}
                              {lesson.hasNotes && (
                                <Box mt={1}>
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mb={0.5}
                                  >
                                    <NoteIcon fontSize="small" />
                                    <Typography
                                      variant="caption"
                                      fontWeight="medium"
                                    >
                                      הערות ({lesson.notesCount}):
                                    </Typography>
                                  </Box>
                                  <List dense sx={{ pl: 2 }}>
                                    {lesson.notes.map((note, noteIndex) => (
                                      <ListItem key={noteIndex} sx={{ py: 0 }}>
                                        <ListItemText
                                          primary={
                                            <Typography variant="caption">
                                              {note}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  אין שיעורים באוסף זה
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ToraLessonsPage;

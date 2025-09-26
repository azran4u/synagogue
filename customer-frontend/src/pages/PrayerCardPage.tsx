import React, { useEffect, useState } from "react";
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
  Divider,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Event as EventIcon,
  ChildCare as ChildCareIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useAuth } from "../hooks/useAuth";
import { usePrayerCard, useCreatePrayerCard } from "../hooks/usePrayerCard";
import { HebrewDateSelector } from "../components/HebrewDateSelector";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerCard, Prayer } from "../model/Prayer";
import { PrayerEvent } from "../model/PrayerEvent";
import { PrayerEventType } from "../model/PrayerEventType";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

// Form interfaces
interface ChildFormValues {
  firstName: string;
  lastName: string;
  hebrewBirthDate: HebrewDate | null;
  phoneNumber: string;
  email: string;
  notes: string;
}

interface PrayerCardFormValues {
  firstName: string;
  lastName: string;
  hebrewBirthDate: HebrewDate | null;
  phoneNumber: string;
  email: string;
  notes: string;
  children: ChildFormValues[];
}

interface PrayerEventFormValues {
  eventTypeId: string;
  hebrewDate: HebrewDate | null;
  notes: string;
}

// Validation schemas
const childValidationSchema = Yup.object({
  firstName: Yup.string().required("שם פרטי נדרש"),
  lastName: Yup.string().required("שם משפחה נדרש"),
  phoneNumber: Yup.string().optional(),
  email: Yup.string().email("כתובת אימייל לא תקינה").optional(),
});

const prayerCardValidationSchema = Yup.object({
  firstName: Yup.string().required("שם פרטי נדרש"),
  lastName: Yup.string().required("שם משפחה נדרש"),
  phoneNumber: Yup.string().optional(),
  email: Yup.string().email("כתובת אימייל לא תקינה").optional(),
  children: Yup.array().of(childValidationSchema),
});

const prayerEventValidationSchema = Yup.object({
  eventTypeId: Yup.string().required("סוג האירוע נדרש"),
  hebrewDate: Yup.mixed().required("תאריך נדרש").nullable(),
  notes: Yup.string().optional(),
});

// Initial values
const initialPrayerCardFormValues: PrayerCardFormValues = {
  firstName: "",
  lastName: "",
  hebrewBirthDate: null,
  phoneNumber: "",
  email: "",
  notes: "",
  children: [],
};

const initialPrayerEventFormValues: PrayerEventFormValues = {
  eventTypeId: "",
  hebrewDate: null,
  notes: "",
};

const PrayerCardContent: React.FC = () => {
  const { user } = useAuth();
  const { data: prayerCard, isLoading } = usePrayerCard();
  const createPrayerMutation = useCreatePrayerCard();
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const { data: aliyaTypes } = useAliyaTypes();
  const { data: aliyaGroups } = useAliyaGroups();
  const navigate = useSynagogueNavigate();

  useEffect(() => {
    console.log("prayerCard", prayerCard);
  }, [prayerCard]);
  // State for editing
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEditChildDialog, setShowEditChildDialog] = useState(false);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(
    null
  );
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(
    null
  );

  const handleCreatePrayerCard = async (
    values: PrayerCardFormValues,
    { setSubmitting }: FormikHelpers<PrayerCardFormValues>
  ) => {
    if (!user) return;

    try {
      // Create main prayer
      const prayer = new Prayer(
        user?.email!,
        values.firstName,
        values.lastName,
        values.hebrewBirthDate || undefined,
        values.phoneNumber || undefined,
        values.email || undefined,
        values.notes
      );

      // Create children prayers
      const childrenPrayers = values.children.map(child =>
        Prayer.create(
          child.firstName,
          child.lastName,
          child.hebrewBirthDate || undefined,
          child.phoneNumber || undefined,
          child.email || undefined,
          child.notes
        )
      );

      // Create prayer card with children
      const newPrayerCard = PrayerCard.create(prayer, childrenPrayers);

      await createPrayerMutation.mutateAsync(newPrayerCard);
      setShowCreateDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating prayer card:", error);
      setSubmitting(false);
    }
  };

  const handleEditPrayerCard = () => {
    setShowEditDialog(true);
  };

  const handleUpdatePrayerCard = async (
    values: PrayerCardFormValues,
    { setSubmitting }: FormikHelpers<PrayerCardFormValues>
  ) => {
    if (!user || !prayerCard) return;

    try {
      // Update main prayer
      const updatedPrayer = prayerCard.prayer.update({
        firstName: values.firstName,
        lastName: values.lastName,
        hebrewBirthDate: values.hebrewBirthDate || undefined,
        phoneNumber: values.phoneNumber || undefined,
        email: values.email || undefined,
        notes: values.notes,
      });

      // Update children prayers
      const updatedChildrenPrayers = values.children.map(child =>
        Prayer.create(
          child.firstName,
          child.lastName,
          child.hebrewBirthDate || undefined,
          child.phoneNumber || undefined,
          child.email || undefined,
          child.notes
        )
      );

      // Create updated prayer card
      const updatedPrayerCard = PrayerCard.create(
        updatedPrayer,
        updatedChildrenPrayers
      );

      await createPrayerMutation.mutateAsync(updatedPrayerCard);
      setShowEditDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating prayer card:", error);
      setSubmitting(false);
    }
  };

  const handleCreatePrayerEvent = async (
    values: PrayerEventFormValues,
    { setSubmitting }: FormikHelpers<PrayerEventFormValues>
  ) => {
    if (!prayerCard) return;

    try {
      // Create new prayer event
      const newEvent = PrayerEvent.create(
        values.eventTypeId,
        values.hebrewDate?.toString() || "",
        values.notes || undefined
      );

      // Add event to prayer
      const updatedPrayer = prayerCard.prayer.addPrayerEvent(newEvent);

      // Create updated prayer card
      const updatedPrayerCard = PrayerCard.create(
        updatedPrayer,
        prayerCard.children
      );

      await createPrayerMutation.mutateAsync(updatedPrayerCard);
      setShowEventDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating prayer event:", error);
      setSubmitting(false);
    }
  };

  const handleDeletePrayerEvent = async (eventIndex: number) => {
    if (!prayerCard) return;

    if (window.confirm("האם אתה בטוח שברצונך למחוק את האירוע הזה?")) {
      try {
        // Remove event from prayer
        const updatedPrayer = prayerCard.prayer.removePrayerEvent(eventIndex);

        // Create updated prayer card
        const updatedPrayerCard = PrayerCard.create(
          updatedPrayer,
          prayerCard.children
        );

        await createPrayerMutation.mutateAsync(updatedPrayerCard);
      } catch (error) {
        console.error("Error deleting prayer event:", error);
      }
    }
  };

  const handleDeleteChild = async (childIndex: number) => {
    if (!prayerCard) return;

    const child = prayerCard.children[childIndex];
    const childName = `${child.firstName} ${child.lastName}`;

    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ${childName}?`)) {
      try {
        // Remove child from children array
        const updatedChildren = prayerCard.children.filter(
          (_, index) => index !== childIndex
        );

        // Create updated prayer card
        const updatedPrayerCard = PrayerCard.create(
          prayerCard.prayer,
          updatedChildren
        );

        await createPrayerMutation.mutateAsync(updatedPrayerCard);
      } catch (error) {
        console.error("Error deleting child:", error);
      }
    }
  };

  const handleEditChild = (childIndex: number) => {
    setEditingChildIndex(childIndex);
    setShowEditChildDialog(true);
  };

  const handleUpdateChild = async (
    values: ChildFormValues,
    { setSubmitting }: FormikHelpers<ChildFormValues>
  ) => {
    if (!prayerCard || editingChildIndex === null) return;

    try {
      // Create updated child
      const updatedChild = Prayer.create(
        values.firstName,
        values.lastName,
        values.hebrewBirthDate || undefined,
        values.phoneNumber || undefined,
        values.email || undefined,
        values.notes
      );

      // Update children array
      const updatedChildren = prayerCard.children.map((child, index) =>
        index === editingChildIndex ? updatedChild : child
      );

      // Create updated prayer card
      const updatedPrayerCard = PrayerCard.create(
        prayerCard.prayer,
        updatedChildren
      );

      await createPrayerMutation.mutateAsync(updatedPrayerCard);
      setShowEditChildDialog(false);
      setEditingChildIndex(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating child:", error);
      setSubmitting(false);
    }
  };

  const handleEditPrayerEvent = (eventIndex: number) => {
    setEditingEventIndex(eventIndex);
    setShowEditEventDialog(true);
  };

  const handleUpdatePrayerEvent = async (
    values: PrayerEventFormValues,
    { setSubmitting }: FormikHelpers<PrayerEventFormValues>
  ) => {
    if (!prayerCard || editingEventIndex === null) return;

    try {
      // Find the event type
      const eventType = prayerEventTypes?.find(
        type => type.id === values.eventTypeId
      );
      if (!eventType) {
        console.error("Event type not found");
        return;
      }

      // Create updated event
      const updatedEvent = new PrayerEvent(
        values.eventTypeId,
        values.hebrewDate?.toString() || "",
        values.notes || undefined
      );

      // Update events array
      const updatedEvents = prayerCard.prayer.events.map((event, index) =>
        index === editingEventIndex ? updatedEvent : event
      );

      // Create updated prayer
      const updatedPrayer = new Prayer(
        prayerCard.prayer.id,
        prayerCard.prayer.firstName,
        prayerCard.prayer.lastName,
        prayerCard.prayer.hebrewBirthDate,
        prayerCard.prayer.phoneNumber,
        prayerCard.prayer.email,
        prayerCard.prayer.notes,
        prayerCard.prayer.aliyot,
        updatedEvents
      );

      // Create updated prayer card
      const updatedPrayerCard = PrayerCard.create(
        updatedPrayer,
        prayerCard.children
      );

      await createPrayerMutation.mutateAsync(updatedPrayerCard);
      setShowEditEventDialog(false);
      setEditingEventIndex(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating prayer event:", error);
      setSubmitting(false);
    }
  };

  const addChild = (setFieldValue: any, children: ChildFormValues[]) => {
    const newChild: ChildFormValues = {
      firstName: "",
      lastName: "",
      hebrewBirthDate: null,
      phoneNumber: "",
      email: "",
      notes: "",
    };
    setFieldValue("children", [...children, newChild]);
  };

  const removeChild = (
    setFieldValue: any,
    children: ChildFormValues[],
    index: number
  ) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setFieldValue("children", updatedChildren);
  };

  const handleBackToHome = () => {
    navigate("");
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען כרטיס מתפלל...
        </Typography>
      </Box>
    );
  }

  // If user has a prayer card, show it
  if (prayerCard) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
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
              textAlign: "center",
              order: { xs: 2, sm: 1 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            כרטיס המתפלל שלי
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
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditPrayerCard}
              sx={{
                mr: { xs: 1, sm: 2 },
                flex: { xs: 1, sm: "none" },
                maxWidth: { xs: "48%", sm: "none" },
              }}
            >
              ערוך
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Personal Information */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonIcon />
                פרטים אישיים
              </Typography>

              <Typography variant="h5" gutterBottom>
                {prayerCard.prayer.firstName} {prayerCard.prayer.lastName}
              </Typography>

              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    תאריך לידה:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {prayerCard.prayer.hebrewBirthDate
                      ? prayerCard.prayer.hebrewBirthDate.toString()
                      : "לא צוין"}
                  </Typography>
                </Box>

                {prayerCard.prayer.phoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      טלפון:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.phoneNumber}
                    </Typography>
                  </Box>
                )}

                {prayerCard.prayer.email && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      אימייל:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.email}
                    </Typography>
                  </Box>
                )}

                {prayerCard.prayer.notes && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      הערות:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Children */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ChildCareIcon />
                ילדים ({prayerCard.children.length})
              </Typography>

              {prayerCard.children.length > 0 ? (
                <Stack spacing={2}>
                  {prayerCard.children.map((child, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6">
                            {child.firstName} {child.lastName}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                              sx={{ ml: 1, fontWeight: 400 }}
                            >
                              בן/בת {prayerCard.prayer.firstName}{" "}
                              {prayerCard.prayer.lastName}
                            </Typography>
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditChild(index)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteChild(index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>

                        <Stack spacing={1}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ minWidth: 100 }}
                            >
                              תאריך לידה:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {child.hebrewBirthDate
                                ? child.hebrewBirthDate.toString()
                                : "לא צוין"}
                            </Typography>
                          </Box>

                          {child.phoneNumber && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                טלפון:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.phoneNumber}
                              </Typography>
                            </Box>
                          )}

                          {child.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                אימייל:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.email}
                              </Typography>
                            </Box>
                          )}

                          {child.notes && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                הערות:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.notes}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  אין ילדים רשומים
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <EventIcon />
                  אירועים ({prayerCard.prayer.events.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setShowEventDialog(true)}
                  size="small"
                >
                  הוסף אירוע
                </Button>
              </Box>

              {prayerCard.prayer.events.length > 0 ? (
                <Stack spacing={2}>
                  {prayerCard.prayer.events.map((event, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "background.paper",
                      }}
                    >
                      {/* Header with event info and action buttons */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          mb: event.notes ? 1 : 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flex: 1,
                            minWidth: 0, // Allow text to truncate on small screens
                          }}
                        >
                          <Chip
                            label={event.type}
                            size="small"
                            color="primary"
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {event.hebrewDate}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditPrayerEvent(index)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePrayerEvent(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Notes section at the bottom */}
                      {event.notes && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 500,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            הערות:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                            }}
                          >
                            {event.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  אין אירועים רשומים
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Aliyot History */}
          <Card>
            <CardContent>
              {/* Get all aliyot from main prayer and children */}
              {(() => {
                const allAliyot = [
                  ...prayerCard.prayer.aliyot.map(aliya => ({
                    aliya,
                    person: prayerCard.prayer,
                    isChild: false,
                  })),
                  ...prayerCard.children.flatMap(child =>
                    child.aliyot.map(aliya => ({
                      aliya,
                      person: child,
                      isChild: true,
                    }))
                  ),
                ].sort((a, b) => {
                  const groupA = aliyaGroups?.find(
                    g => g.id === a.aliya.aliyaGroupId
                  );
                  const groupB = aliyaGroups?.find(
                    g => g.id === b.aliya.aliyaGroupId
                  );
                  return (groupA?.hebrewDate.toString() || "").localeCompare(
                    groupB?.hebrewDate.toString() || ""
                  );
                });

                return (
                  <>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <GroupIcon />
                      עליות ({allAliyot.length})
                    </Typography>

                    {allAliyot.length > 0 ? (
                      <Stack spacing={2}>
                        {allAliyot.map(({ aliya, person, isChild }, index) => {
                          const aliyaType = aliyaTypes?.find(
                            type => type.id === aliya.aliyaType
                          );
                          const aliyaGroup = aliyaGroups?.find(
                            group => group.id === aliya.aliyaGroupId
                          );
                          return (
                            <Box
                              key={`${person.id}-${aliya.aliyaGroupId}-${aliya.aliyaType}`}
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                                gap: { xs: 1, sm: 2 },
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                backgroundColor: "background.paper",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: { xs: "auto", sm: 120 },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {person.firstName} {person.lastName}
                                </Typography>
                                {isChild && (
                                  <Chip
                                    label="ילד"
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  gap: { xs: 1, sm: 2 },
                                  flex: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    alignItems: {
                                      xs: "flex-start",
                                      sm: "center",
                                    },
                                    gap: { xs: 1, sm: 2 },
                                    flex: 1,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {aliyaGroup && (
                                      <Chip
                                        label={aliyaGroup.label}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    )}
                                    <Chip
                                      label={
                                        aliyaType?.displayName ||
                                        aliya.aliyaType
                                      }
                                      size="small"
                                      color={
                                        aliyaType?.isHighPriority
                                          ? "error"
                                          : aliyaType?.isMediumPriority
                                            ? "warning"
                                            : "secondary"
                                      }
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    {aliyaGroup?.hebrewDate.toString() ||
                                      "תאריך לא ידוע"}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        אין עליות רשומות
                      </Typography>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Box>

        {/* Edit Prayer Card Dialog */}
        <Dialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>ערוך כרטיס מתפלל</DialogTitle>
          <DialogContent>
            <Formik
              initialValues={{
                firstName: (prayerCard as any)?.prayer?.firstName || "",
                lastName: (prayerCard as any)?.prayer?.lastName || "",
                hebrewBirthDate:
                  (prayerCard as any)?.prayer?.hebrewBirthDate || null,
                phoneNumber: (prayerCard as any)?.prayer?.phoneNumber || "",
                email: (prayerCard as any)?.prayer?.email || "",
                notes: (prayerCard as any)?.prayer?.notes || "",
                children:
                  (prayerCard as any)?.children?.map((child: any) => ({
                    firstName: child.firstName || "",
                    lastName: child.lastName || "",
                    hebrewBirthDate: child.hebrewBirthDate || null,
                    phoneNumber: child.phoneNumber || "",
                    email: child.email || "",
                    notes: child.notes || "",
                  })) || [],
              }}
              validationSchema={prayerCardValidationSchema}
              onSubmit={handleUpdatePrayerCard}
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
                    {/* Personal Information */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        פרטים אישיים
                      </Typography>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <TextField
                            name="firstName"
                            label="שם פרטי"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.firstName && Boolean(errors.firstName)
                            }
                            helperText={
                              touched.firstName && (errors.firstName as string)
                            }
                            required
                            fullWidth
                          />
                          <TextField
                            name="lastName"
                            label="שם משפחה"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.lastName && Boolean(errors.lastName)}
                            helperText={
                              touched.lastName && (errors.lastName as string)
                            }
                            required
                            fullWidth
                          />
                        </Stack>
                        <HebrewDateSelector
                          value={values.hebrewBirthDate}
                          onChange={date =>
                            setFieldValue("hebrewBirthDate", date || null)
                          }
                          label="תאריך לידה"
                        />

                        <Stack direction="row" spacing={2}>
                          <TextField
                            name="phoneNumber"
                            label="נייד"
                            value={values.phoneNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.phoneNumber && Boolean(errors.phoneNumber)
                            }
                            helperText={
                              touched.phoneNumber &&
                              (errors.phoneNumber as string)
                            }
                            fullWidth
                          />
                          <TextField
                            name="email"
                            label="אימייל"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && Boolean(errors.email)}
                            helperText={
                              touched.email && (errors.email as string)
                            }
                            fullWidth
                          />
                        </Stack>
                        <TextField
                          name="notes"
                          label="הערות אישיות"
                          value={values.notes}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          multiline
                          rows={2}
                          fullWidth
                        />
                      </Stack>
                    </Box>

                    <Divider />

                    {/* Children */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6">ילדים</Typography>
                        <Button
                          type="button"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            addChild(setFieldValue, values.children)
                          }
                          size="small"
                        >
                          הוסף ילד
                        </Button>
                      </Box>
                      <Stack spacing={2}>
                        {values.children.map((child: any, index: number) => (
                          <Card key={index} variant="outlined">
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Typography variant="subtitle1">
                                  ילד {index + 1}
                                </Typography>
                                <IconButton
                                  type="button"
                                  onClick={() =>
                                    removeChild(
                                      setFieldValue,
                                      values.children,
                                      index
                                    )
                                  }
                                  color="error"
                                  size="small"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Stack spacing={2}>
                                <Stack direction="row" spacing={2}>
                                  <TextField
                                    name={`children.${index}.firstName`}
                                    label="שם פרטי"
                                    value={child.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                      (touched.children as any)?.[index]
                                        ?.firstName &&
                                      Boolean(
                                        (
                                          (errors.children as any)?.[
                                            index
                                          ] as any
                                        )?.firstName
                                      )
                                    }
                                    helperText={
                                      (touched.children as any)?.[index]
                                        ?.firstName &&
                                      ((errors.children as any)?.[index] as any)
                                        ?.firstName
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                  <TextField
                                    name={`children.${index}.lastName`}
                                    label="שם משפחה"
                                    value={child.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                      (touched.children as any)?.[index]
                                        ?.lastName &&
                                      Boolean(
                                        (
                                          (errors.children as any)?.[
                                            index
                                          ] as any
                                        )?.lastName
                                      )
                                    }
                                    helperText={
                                      (touched.children as any)?.[index]
                                        ?.lastName &&
                                      ((errors.children as any)?.[index] as any)
                                        ?.lastName
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                </Stack>
                                <HebrewDateSelector
                                  value={child.hebrewBirthDate}
                                  onChange={date =>
                                    setFieldValue(
                                      `children.${index}.hebrewBirthDate`,
                                      date || null
                                    )
                                  }
                                  label="תאריך לידה"
                                />

                                <Stack direction="row" spacing={2}>
                                  <TextField
                                    name={`children.${index}.phoneNumber`}
                                    label="נייד"
                                    value={child.phoneNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                      (touched.children as any)?.[index]
                                        ?.phoneNumber &&
                                      Boolean(
                                        (errors.children as any)?.[index]
                                          ?.phoneNumber
                                      )
                                    }
                                    helperText={
                                      (touched.children as any)?.[index]
                                        ?.phoneNumber &&
                                      (errors.children as any)?.[index]
                                        ?.phoneNumber
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                  <TextField
                                    name={`children.${index}.email`}
                                    label="אימייל"
                                    type="email"
                                    value={child.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={
                                      (touched.children as any)?.[index]
                                        ?.email &&
                                      Boolean(
                                        (errors.children as any)?.[index]?.email
                                      )
                                    }
                                    helperText={
                                      (touched.children as any)?.[index]
                                        ?.email &&
                                      (errors.children as any)?.[index]?.email
                                    }
                                    size="small"
                                    fullWidth
                                  />
                                </Stack>
                                <TextField
                                  name={`children.${index}.notes`}
                                  label="הערות"
                                  value={child.notes}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  multiline
                                  rows={1}
                                  size="small"
                                  fullWidth
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>
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
                      disabled={isSubmitting || createPrayerMutation.isPending}
                    >
                      {createPrayerMutation.isPending
                        ? "שומר..."
                        : "שמור שינויים"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* Create Prayer Event Dialog */}
        <Dialog
          open={showEventDialog}
          onClose={() => setShowEventDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>הוסף אירוע</DialogTitle>
          <DialogContent>
            <Formik
              initialValues={initialPrayerEventFormValues}
              validationSchema={prayerEventValidationSchema}
              onSubmit={handleCreatePrayerEvent}
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
                    <FormControl fullWidth>
                      <InputLabel>סוג האירוע</InputLabel>
                      <Select
                        name="eventTypeId"
                        value={values.eventTypeId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.eventTypeId && Boolean(errors.eventTypeId)
                        }
                        label="סוג האירוע"
                      >
                        {prayerEventTypes
                          ?.filter(type => type.enabled)
                          ?.map(eventType => (
                            <MenuItem
                              key={eventType.id}
                              value={eventType.displayName}
                            >
                              {eventType.displayName}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <HebrewDateSelector
                      value={values.hebrewDate}
                      onChange={date =>
                        setFieldValue("hebrewDate", date || null)
                      }
                      label="תאריך האירוע"
                    />

                    <TextField
                      name="notes"
                      label="הערות (אופציונלי)"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Stack>
                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowEventDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || createPrayerMutation.isPending}
                    >
                      {createPrayerMutation.isPending ? "יוצר..." : "צור אירוע"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>

        {/* Edit Child Dialog */}
        <Dialog
          open={showEditChildDialog}
          onClose={() => setShowEditChildDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>ערוך ילד</DialogTitle>
          <DialogContent>
            {editingChildIndex !== null && prayerCard && (
              <Formik
                initialValues={{
                  firstName:
                    prayerCard.children[editingChildIndex]?.firstName || "",
                  lastName:
                    prayerCard.children[editingChildIndex]?.lastName || "",
                  hebrewBirthDate:
                    prayerCard.children[editingChildIndex]?.hebrewBirthDate ||
                    null,
                  phoneNumber:
                    prayerCard.children[editingChildIndex]?.phoneNumber || "",
                  email: prayerCard.children[editingChildIndex]?.email || "",
                  notes: prayerCard.children[editingChildIndex]?.notes || "",
                }}
                validationSchema={childValidationSchema}
                onSubmit={handleUpdateChild}
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
                      <Stack direction="row" spacing={2}>
                        <TextField
                          name="firstName"
                          label="שם פרטי"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                          required
                          fullWidth
                        />
                        <TextField
                          name="lastName"
                          label="שם משפחה"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                          required
                          fullWidth
                        />
                      </Stack>

                      <HebrewDateSelector
                        value={values.hebrewBirthDate}
                        onChange={date =>
                          setFieldValue("hebrewBirthDate", date || null)
                        }
                        label="תאריך לידה"
                      />

                      <Stack direction="row" spacing={2}>
                        <TextField
                          name="phoneNumber"
                          label="נייד"
                          value={values.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.phoneNumber && Boolean(errors.phoneNumber)
                          }
                          helperText={touched.phoneNumber && errors.phoneNumber}
                          fullWidth
                        />
                        <TextField
                          name="email"
                          label="אימייל"
                          type="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          fullWidth
                        />
                      </Stack>

                      <TextField
                        name="notes"
                        label="הערות (אופציונלי)"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Stack>
                    <DialogActions>
                      <Button
                        type="button"
                        onClick={() => setShowEditChildDialog(false)}
                      >
                        ביטול
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={
                          isSubmitting || createPrayerMutation.isPending
                        }
                      >
                        {createPrayerMutation.isPending
                          ? "שומר..."
                          : "שמור שינויים"}
                      </Button>
                    </DialogActions>
                  </Form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Prayer Event Dialog */}
        <Dialog
          open={showEditEventDialog}
          onClose={() => setShowEditEventDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>ערוך אירוע</DialogTitle>
          <DialogContent>
            {editingEventIndex !== null && prayerCard && (
              <Formik
                initialValues={{
                  eventTypeId:
                    prayerCard.prayer.events[editingEventIndex]?.type || "",
                  hebrewDate:
                    (prayerCard.prayer.events[editingEventIndex]
                      ?.hebrewDate as any) || null,
                  notes:
                    prayerCard.prayer.events[editingEventIndex]?.notes || "",
                }}
                validationSchema={prayerEventValidationSchema}
                onSubmit={handleUpdatePrayerEvent}
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
                      <FormControl
                        fullWidth
                        error={
                          touched.eventTypeId && Boolean(errors.eventTypeId)
                        }
                      >
                        <InputLabel>סוג אירוע</InputLabel>
                        <Select
                          name="eventTypeId"
                          value={values.eventTypeId}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label="סוג אירוע"
                        >
                          {prayerEventTypes
                            ?.filter(type => type.enabled)
                            ?.map(type => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.displayName}
                              </MenuItem>
                            ))}
                        </Select>
                        {touched.eventTypeId && errors.eventTypeId && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, ml: 2 }}
                          >
                            {errors.eventTypeId}
                          </Typography>
                        )}
                      </FormControl>

                      <HebrewDateSelector
                        value={values.hebrewDate}
                        onChange={date =>
                          setFieldValue("hebrewDate", date || null)
                        }
                        label="תאריך האירוע"
                      />

                      <TextField
                        name="notes"
                        label="הערות (אופציונלי)"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Stack>
                    <DialogActions>
                      <Button
                        type="button"
                        onClick={() => setShowEditEventDialog(false)}
                      >
                        ביטול
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={
                          isSubmitting || createPrayerMutation.isPending
                        }
                      >
                        {createPrayerMutation.isPending
                          ? "שומר..."
                          : "שמור שינויים"}
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
  }

  // If user doesn't have a prayer card, show creation option
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">צור כרטיס מתפלל</Typography>
        <Button variant="outlined" onClick={handleBackToHome}>
          חזור לדף הבית
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <PersonIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            התחל את המסע שלך
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            צור את כרטיס המתפלל שלך כדי לנהל את הפרטים האישיים והמשפחתיים
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowCreateDialog(true)}
            startIcon={<PersonIcon />}
            sx={{ minWidth: 200 }}
          >
            צור כרטיס מתפלל
          </Button>
        </CardContent>
      </Card>

      {/* Create Prayer Card Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>צור כרטיס מתפלל</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialPrayerCardFormValues}
            validationSchema={prayerCardValidationSchema}
            onSubmit={handleCreatePrayerCard}
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
                  {/* Personal Information */}
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      פרטים אישיים
                    </Typography>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <TextField
                          name="firstName"
                          label="שם פרטי"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={
                            touched.firstName && (errors.firstName as string)
                          }
                          required
                          fullWidth
                        />
                        <TextField
                          name="lastName"
                          label="שם משפחה"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={
                            touched.lastName && (errors.lastName as string)
                          }
                          required
                          fullWidth
                        />
                      </Stack>
                      <HebrewDateSelector
                        value={values.hebrewBirthDate}
                        onChange={date =>
                          setFieldValue("hebrewBirthDate", date || null)
                        }
                        label="תאריך לידה"
                      />

                      <Stack direction="row" spacing={2}>
                        <TextField
                          name="phoneNumber"
                          label="נייד"
                          value={values.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.phoneNumber && Boolean(errors.phoneNumber)
                          }
                          helperText={touched.phoneNumber && errors.phoneNumber}
                          fullWidth
                        />
                        <TextField
                          name="email"
                          label="אימייל"
                          type="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          fullWidth
                        />
                      </Stack>

                      <TextField
                        name="notes"
                        label="הערות אישיות"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Children */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">ילדים</Typography>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => addChild(setFieldValue, values.children)}
                        size="small"
                      >
                        הוסף ילד
                      </Button>
                    </Box>
                    <Stack spacing={2}>
                      {values.children.map((child: any, index: number) => (
                        <Card key={index} variant="outlined">
                          <CardContent>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                              }}
                            >
                              <Typography variant="subtitle1">
                                ילד {index + 1}
                              </Typography>
                              <IconButton
                                type="button"
                                onClick={() =>
                                  removeChild(
                                    setFieldValue,
                                    values.children,
                                    index
                                  )
                                }
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={2}>
                                <TextField
                                  name={`children.${index}.firstName`}
                                  label="שם פרטי"
                                  value={child.firstName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    (touched.children as any)?.[index]
                                      ?.firstName &&
                                    Boolean(
                                      ((errors.children as any)?.[index] as any)
                                        ?.firstName
                                    )
                                  }
                                  helperText={
                                    (touched.children as any)?.[index]
                                      ?.firstName &&
                                    ((errors.children as any)?.[index] as any)
                                      ?.firstName
                                  }
                                  size="small"
                                  fullWidth
                                />
                                <TextField
                                  name={`children.${index}.lastName`}
                                  label="שם משפחה"
                                  value={child.lastName}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  error={
                                    (touched.children as any)?.[index]
                                      ?.lastName &&
                                    Boolean(
                                      ((errors.children as any)?.[index] as any)
                                        ?.lastName
                                    )
                                  }
                                  helperText={
                                    (touched.children as any)?.[index]
                                      ?.lastName &&
                                    ((errors.children as any)?.[index] as any)
                                      ?.lastName
                                  }
                                  size="small"
                                  fullWidth
                                />
                              </Stack>
                              <HebrewDateSelector
                                value={child.hebrewBirthDate}
                                onChange={date =>
                                  setFieldValue(
                                    `children.${index}.hebrewBirthDate`,
                                    date || null
                                  )
                                }
                                label="תאריך לידה"
                              />
                              <TextField
                                name={`children.${index}.notes`}
                                label="הערות"
                                value={child.notes}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                multiline
                                rows={1}
                                size="small"
                                fullWidth
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
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
                    disabled={isSubmitting || createPrayerMutation.isPending}
                  >
                    {createPrayerMutation.isPending
                      ? "יוצר..."
                      : "צור כרטיס מתפלל"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default () => {
  return (
    // <WithLogin>
    <PrayerCardContent />
    // </WithLogin>
  );
};

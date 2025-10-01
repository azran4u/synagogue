import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { HebrewDateSelector } from "./HebrewDateSelector";
import { EventTypeSelector } from "./EventTypeSelector";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerCard, Prayer } from "../model/Prayer";
import { PrayerEvent } from "../model/PrayerEvent";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";

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
  hebrewDate: HebrewDate;
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
  hebrewDate: Yup.mixed().required("תאריך נדרש"),
  notes: Yup.string().optional(),
});

interface PrayerCardEditDialogProps {
  open: boolean;
  onClose: () => void;
  prayerCard: PrayerCard | null;
  onSave: (updatedPrayerCard: PrayerCard) => Promise<void>;
  isLoading?: boolean;
  title?: string;
}

export const PrayerCardEditDialog: React.FC<PrayerCardEditDialogProps> = ({
  open,
  onClose,
  prayerCard,
  onSave,
  isLoading = false,
  title = "ערוך כרטיס מתפלל",
}) => {
  const { data: prayerEventTypes } = usePrayerEventTypes();

  // State for child editing
  const [showEditChildDialog, setShowEditChildDialog] = useState(false);
  const [editingChildIndex, setEditingChildIndex] = useState<number | null>(
    null
  );
  const [currentFormValues, setCurrentFormValues] =
    useState<PrayerCardFormValues | null>(null);

  // State for event management
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEditEventDialog, setShowEditEventDialog] = useState(false);
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (prayerCard != null && editingEventIndex !== null) {
      console.log(
        "prayerCard?.prayer.events?[editingEventIndex]",
        prayerCard?.prayer.events?.[editingEventIndex]
      );
    }
  }, [prayerCard, editingEventIndex]);

  const handleSubmit = async (
    values: PrayerCardFormValues,
    { setSubmitting }: FormikHelpers<PrayerCardFormValues>
  ) => {
    if (!prayerCard) return;

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

      await onSave(updatedPrayerCard);
      onClose();
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
    if (!prayerCard || !currentFormValues) return;

    try {
      // Create new prayer event
      const newEvent = PrayerEvent.create(
        values.eventTypeId,
        values.hebrewDate,
        values.notes || undefined
      );

      // Add event to prayer
      const updatedPrayer = prayerCard.prayer.addPrayerEvent(newEvent);

      // Create updated prayer card
      const updatedPrayerCard = PrayerCard.create(
        updatedPrayer,
        prayerCard.children
      );

      await onSave(updatedPrayerCard);
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

        await onSave(updatedPrayerCard);
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

        await onSave(updatedPrayerCard);
      } catch (error) {
        console.error("Error deleting child:", error);
      }
    }
  };

  const handleEditChild = (
    childIndex: number,
    formValues: PrayerCardFormValues
  ) => {
    setEditingChildIndex(childIndex);
    setCurrentFormValues(formValues);
    setShowEditChildDialog(true);
  };

  const handleUpdateChild = async (
    values: ChildFormValues,
    { setSubmitting }: FormikHelpers<ChildFormValues>
  ) => {
    if (!prayerCard || editingChildIndex === null || !currentFormValues) return;

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

      await onSave(updatedPrayerCard);
      setShowEditChildDialog(false);
      setEditingChildIndex(null);
      setCurrentFormValues(null);
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
      // Create updated event
      const updatedEvent = new PrayerEvent(
        values.eventTypeId,
        values.hebrewDate,
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

      await onSave(updatedPrayerCard);
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

  if (!prayerCard) return null;

  return (
    <>
      {/* Main Edit Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              firstName: prayerCard.prayer.firstName || "",
              lastName: prayerCard.prayer.lastName || "",
              hebrewBirthDate: prayerCard.prayer.hebrewBirthDate || null,
              phoneNumber: prayerCard.prayer.phoneNumber || "",
              email: prayerCard.prayer.email || "",
              notes: prayerCard.prayer.notes || "",
              children: prayerCard.children.map(child => ({
                firstName: child.firstName || "",
                lastName: child.lastName || "",
                hebrewBirthDate: child.hebrewBirthDate || null,
                phoneNumber: child.phoneNumber || "",
                email: child.email || "",
                notes: child.notes || "",
              })),
            }}
            validationSchema={prayerCardValidationSchema}
            onSubmit={handleSubmit}
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
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                      >
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
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <IconButton
                                  type="button"
                                  onClick={() => handleEditChild(index, values)}
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
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
                                      (errors.children as any)?.[index]
                                        ?.firstName
                                    )
                                  }
                                  helperText={
                                    (touched.children as any)?.[index]
                                      ?.firstName &&
                                    (errors.children as any)?.[index]?.firstName
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
                                      (errors.children as any)?.[index]
                                        ?.lastName
                                    )
                                  }
                                  helperText={
                                    (touched.children as any)?.[index]
                                      ?.lastName &&
                                    (errors.children as any)?.[index]?.lastName
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
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                              >
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
                                    (touched.children as any)?.[index]?.email &&
                                    Boolean(
                                      (errors.children as any)?.[index]?.email
                                    )
                                  }
                                  helperText={
                                    (touched.children as any)?.[index]?.email &&
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

                  <Divider />

                  {/* Events Management */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6">
                        אירועים ({prayerCard.prayer.events.length})
                      </Typography>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setCurrentFormValues(values);
                          setShowEventDialog(true);
                        }}
                        size="small"
                      >
                        הוסף אירוע
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {prayerCard.prayer.events.map((event, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {prayerEventTypes?.find(
                                type => type.id === event.type
                              )?.displayName || event.type}{" "}
                              - {event.hebrewDate.toString()}
                            </Typography>
                            {event.notes && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {event.notes}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
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
                      ))}
                    </Stack>
                  </Box>
                </Stack>
                <DialogActions>
                  <Button type="button" onClick={onClose}>
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || isLoading}
                  >
                    {isLoading ? "שומר..." : "שמור שינויים"}
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
            initialValues={{
              eventTypeId: "",
              hebrewDate: HebrewDate.now(),
              notes: "",
            }}
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
                  <EventTypeSelector
                    name="eventTypeId"
                    label="סוג האירוע"
                    value={values.eventTypeId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(errors.eventTypeId)}
                    helperText={errors.eventTypeId}
                    touched={touched.eventTypeId}
                  />

                  <HebrewDateSelector
                    value={values.hebrewDate}
                    onChange={date =>
                      setFieldValue("hebrewDate", date || HebrewDate.now())
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "יוצר..." : "צור אירוע"}
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

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "שומר..." : "שמור שינויים"}
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
                  prayerCard.prayer.events[editingEventIndex]?.hebrewDate ||
                  HebrewDate.now(),
                notes: prayerCard.prayer.events[editingEventIndex]?.notes || "",
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
                    <EventTypeSelector
                      name="eventTypeId"
                      label="סוג אירוע"
                      value={values.eventTypeId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.eventTypeId)}
                      helperText={errors.eventTypeId}
                      touched={touched.eventTypeId}
                    />

                    <HebrewDateSelector
                      value={values.hebrewDate}
                      onChange={date =>
                        setFieldValue("hebrewDate", date || HebrewDate.now())
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "שומר..." : "שמור שינויים"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

import React, { useEffect, useMemo, useState } from "react";
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
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { isNil } from "lodash";
// Unified form interface
interface PrayerCardFormValues {
  firstName: string;
  lastName: string;
  hebrewBirthDate: HebrewDate | null;
  phoneNumber: string;
  email: string;
  notes: string;
  children: {
    firstName: string;
    lastName: string;
    hebrewBirthDate: HebrewDate | null;
    phoneNumber: string;
    email: string;
    notes: string;
  }[];
  events: {
    eventTypeId: string;
    hebrewDate: HebrewDate;
    notes: string;
  }[];
}

// Unified validation schema
const prayerCardValidationSchema = Yup.object({
  firstName: Yup.string().required("שם פרטי נדרש"),
  lastName: Yup.string().required("שם משפחה נדרש"),
  phoneNumber: Yup.string().optional(),
  email: Yup.string().email("כתובת אימייל לא תקינה").optional(),
  children: Yup.array().of(
    Yup.object({
      firstName: Yup.string().required("שם פרטי נדרש"),
      lastName: Yup.string().required("שם משפחה נדרש"),
      phoneNumber: Yup.string().optional(),
      email: Yup.string().email("כתובת אימייל לא תקינה").optional(),
    })
  ),
  events: Yup.array().of(
    Yup.object({
      eventTypeId: Yup.string().required("סוג האירוע נדרש"),
      hebrewDate: Yup.mixed().required("תאריך נדרש"),
      notes: Yup.string().optional(),
    })
  ),
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
  title,
}) => {
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const navigate = useSynagogueNavigate();
  const { email } = useUser();

  // Get random event type for initial value
  const initialEventType = useMemo(() => {
    if (!prayerEventTypes || prayerEventTypes.length === 0) {
      return null;
    }
    return prayerEventTypes[0];
  }, [prayerEventTypes]);

  const handleSubmit = async (
    values: PrayerCardFormValues,
    { setSubmitting }: FormikHelpers<PrayerCardFormValues>
  ) => {
    if (isNil(email)) {
      console.error("Email is not set");
      navigate("");
      return;
    }

    try {
      // Create events
      const events = values.events.map(
        event =>
          new PrayerEvent(
            event.eventTypeId,
            event.hebrewDate,
            event.notes || undefined
          )
      );

      // Create main prayer
      let mainPrayer: Prayer;
      if (prayerCard) {
        // Edit mode - update existing prayer
        mainPrayer = prayerCard.prayer.update({
          firstName: values.firstName,
          lastName: values.lastName,
          hebrewBirthDate: values.hebrewBirthDate ?? undefined,
          phoneNumber: values.phoneNumber ?? undefined,
          email: values.email ?? undefined,
          notes: values.notes ?? undefined,
        });
        // Update events
        mainPrayer = new Prayer(
          mainPrayer.id,
          mainPrayer.firstName,
          mainPrayer.lastName,
          mainPrayer.hebrewBirthDate,
          mainPrayer.phoneNumber,
          mainPrayer.email,
          mainPrayer.notes,
          events
        );
      } else {
        // Create mode - create new prayer
        mainPrayer = new Prayer(
          email,
          values.firstName,
          values.lastName,
          values.hebrewBirthDate ?? undefined,
          values.phoneNumber ?? undefined,
          values.email ?? undefined,
          values.notes ?? undefined,
          events
        );
      }

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

      // Create prayer card
      const prayerCardToSave = PrayerCard.create(mainPrayer, childrenPrayers);

      await onSave(prayerCardToSave);
      onClose();
      setSubmitting(false);
    } catch (error) {
      console.error("Error saving prayer card:", error);
      setSubmitting(false);
    }
  };

  // Simple helper functions for form manipulation
  const addChild = (setFieldValue: any, children: any[]) => {
    const newChild = {
      firstName: "",
      lastName: "",
      hebrewBirthDate: null,
      phoneNumber: "",
      email: "",
      notes: "",
    };
    setFieldValue("children", [...children, newChild]);
  };

  const removeChild = (setFieldValue: any, children: any[], index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setFieldValue("children", updatedChildren);
  };

  const addEvent = (setFieldValue: any, events: any[]) => {
    const newEvent = {
      eventTypeId: initialEventType?.id || "", // TODO: review this
      hebrewDate: HebrewDate.now(),
      notes: "",
    };
    setFieldValue("events", [...events, newEvent]);
  };

  const removeEvent = (setFieldValue: any, events: any[], index: number) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    setFieldValue("events", updatedEvents);
  };

  return (
    <>
      {/* Main Edit Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              firstName: prayerCard?.prayer.firstName || "",
              lastName: prayerCard?.prayer.lastName || "",
              hebrewBirthDate: prayerCard?.prayer.hebrewBirthDate || null,
              phoneNumber: prayerCard?.prayer.phoneNumber || "",
              email: prayerCard?.prayer.email || "",
              notes: prayerCard?.prayer.notes || "",
              children:
                prayerCard?.children.map(child => ({
                  firstName: child.firstName || "",
                  lastName: child.lastName || "",
                  hebrewBirthDate: child.hebrewBirthDate || null,
                  phoneNumber: child.phoneNumber || "",
                  email: child.email || "",
                  notes: child.notes || "",
                })) || [],
              events:
                prayerCard?.prayer.events.map(event => ({
                  eventTypeId: event.type,
                  hebrewDate: event.hebrewDate,
                  notes: event.notes || "",
                })) || [],
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
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                      >
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
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                              >
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
                        אירועים ({values.events.length})
                      </Typography>
                      <Button
                        type="button"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => addEvent(setFieldValue, values.events)}
                        size="small"
                      >
                        הוסף אירוע
                      </Button>
                    </Box>
                    <Stack spacing={1}>
                      {values.events.map((event, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                            >
                              <EventTypeSelector
                                name={`events.${index}.eventTypeId`}
                                value={event.eventTypeId}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                label="סוג אירוע"
                              />
                              <Box sx={{ minWidth: { xs: "auto", sm: 200 } }}>
                                <HebrewDateSelector
                                  value={event.hebrewDate}
                                  onChange={date =>
                                    setFieldValue(
                                      `events.${index}.hebrewDate`,
                                      date
                                    )
                                  }
                                  label="תאריך"
                                />
                              </Box>
                            </Stack>
                            <TextField
                              name={`events.${index}.notes`}
                              label="הערות"
                              value={event.notes}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              multiline
                              rows={2}
                              fullWidth
                            />
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  removeEvent(
                                    setFieldValue,
                                    values.events,
                                    index
                                  )
                                }
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Stack>
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
    </>
  );
};

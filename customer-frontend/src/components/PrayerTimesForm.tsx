import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { Formik, Form, FormikHelpers, FieldArray } from "formik";
import * as Yup from "yup";
import { PrayerTimes, PrayerTimeSectionEntry } from "../model/PrayerTimes";

export interface PrayerTimesFormValues {
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes: string;
  sections: Array<{
    title: string;
    displayOrder: number;
    enabled: boolean;
    notes: string;
    times: Array<{
      title: string;
      hour?: string;
      displayOrder: number;
      enabled: boolean;
      notes: string;
    }>;
  }>;
}

export const prayerTimesValidationSchema = Yup.object({
  title: Yup.string().required("כותרת נדרשת"),
  displayOrder: Yup.number().required("סדר תצוגה נדרש"),
  enabled: Yup.boolean().required(),
  notes: Yup.string(),
  sections: Yup.array()
    .of(
      Yup.object({
        title: Yup.string().required("כותרת מדור נדרשת"),
        displayOrder: Yup.number().required("סדר תצוגה נדרש"),
        enabled: Yup.boolean().required(),
        notes: Yup.string(),
        times: Yup.array()
          .of(
            Yup.object({
              title: Yup.string().required("כותרת זמן נדרשת"),
              hour: Yup.string(),
              displayOrder: Yup.number().required("סדר תצוגה נדרש"),
              enabled: Yup.boolean().required(),
              notes: Yup.string(),
            })
          )
          .min(1, "יש להוסיף לפחות זמן תפילה אחד למדור"),
      })
    )
    .min(1, "יש להוסיף לפחות מדור אחד"),
});

export const getInitialFormValues = (
  prayerTimes?: PrayerTimes | null
): PrayerTimesFormValues => {
  if (!prayerTimes) {
    return {
      title: "",
      displayOrder: 0,
      enabled: true,
      notes: "",
      sections: [
        {
          title: "",
          displayOrder: 0,
          enabled: true,
          notes: "",
          times: [
            {
              title: "",
              hour: "",
              displayOrder: 0,
              enabled: true,
              notes: "",
            },
          ],
        },
      ],
    };
  }

  return {
    title: prayerTimes.title,
    displayOrder: prayerTimes.displayOrder,
    enabled: prayerTimes.enabled,
    notes: prayerTimes.notes || "",
    sections: prayerTimes.sections.map(section => ({
      title: section.title,
      displayOrder: section.displayOrder,
      enabled: section.enabled,
      notes: section.notes || "",
      times: section.times.map(time => ({
        title: time.title,
        hour: time.hour || "",
        displayOrder: time.displayOrder,
        enabled: time.enabled,
        notes: time.notes || "",
      })),
    })),
  };
};

interface PrayerTimesFormProps {
  prayerTimes?: PrayerTimes | null;
  onSubmit: (
    values: PrayerTimesFormValues,
    helpers: FormikHelpers<PrayerTimesFormValues>
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const PrayerTimesForm: React.FC<PrayerTimesFormProps> = ({
  prayerTimes,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  return (
    <Formik
      initialValues={getInitialFormValues(prayerTimes)}
      validationSchema={prayerTimesValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting: formIsSubmitting,
      }) => (
        <Form>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Basic Info */}
            <TextField
              fullWidth
              name="title"
              label="כותרת לוח זמנים"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                type="number"
                name="displayOrder"
                label="סדר תצוגה"
                value={values.displayOrder}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.displayOrder && Boolean(errors.displayOrder)}
                helperText={touched.displayOrder && errors.displayOrder}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={values.enabled}
                    onChange={handleChange}
                    name="enabled"
                  />
                }
                label="לוח זמנים פעיל"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              name="notes"
              label="הערות"
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Divider />

            {/* Sections */}
            <Typography variant="h6">מדורים</Typography>

            <FieldArray name="sections">
              {({ push: pushSection, remove: removeSection }) => (
                <Stack spacing={2}>
                  {values.sections.map((section, sectionIndex) => (
                    <Card key={sectionIndex} variant="outlined">
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
                            מדור {sectionIndex + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeSection(sectionIndex)}
                            disabled={values.sections.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            name={`sections.${sectionIndex}.title`}
                            label="כותרת מדור"
                            value={section.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={
                              touched.sections?.[sectionIndex]?.title &&
                              Boolean(
                                (errors.sections as any)?.[sectionIndex]?.title
                              )
                            }
                          />

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                              gap: 2,
                            }}
                          >
                            <TextField
                              fullWidth
                              type="number"
                              name={`sections.${sectionIndex}.displayOrder`}
                              label="סדר תצוגה"
                              value={section.displayOrder}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />

                            <FormControlLabel
                              control={
                                <Switch
                                  checked={section.enabled}
                                  onChange={handleChange}
                                  name={`sections.${sectionIndex}.enabled`}
                                />
                              }
                              label="מדור פעיל"
                            />
                          </Box>

                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            name={`sections.${sectionIndex}.notes`}
                            label="הערות"
                            value={section.notes}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />

                          <Divider />

                          {/* Times within section */}
                          <Typography variant="subtitle2">
                            זמני תפילה
                          </Typography>

                          <FieldArray name={`sections.${sectionIndex}.times`}>
                            {({ push: pushTime, remove: removeTime }) => (
                              <Stack spacing={1}>
                                {section.times.map((time, timeIndex) => (
                                  <Box
                                    key={timeIndex}
                                    sx={{
                                      p: 2,
                                      bgcolor: "background.default",
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: 1,
                                      }}
                                    >
                                      <Typography variant="caption">
                                        זמן {timeIndex + 1}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeTime(timeIndex)}
                                        disabled={section.times.length === 1}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>

                                    <Box
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                          xs: "1fr",
                                          sm: "2fr 1fr 80px",
                                        },
                                        gap: 1,
                                      }}
                                    >
                                      <TextField
                                        fullWidth
                                        size="small"
                                        name={`sections.${sectionIndex}.times.${timeIndex}.title`}
                                        label="שם תפילה"
                                        value={time.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={
                                          touched.sections?.[sectionIndex]
                                            ?.times?.[timeIndex]?.title &&
                                          Boolean(
                                            (errors.sections as any)?.[
                                              sectionIndex
                                            ]?.times?.[timeIndex]?.title
                                          )
                                        }
                                      />

                                      <TextField
                                        fullWidth
                                        size="small"
                                        name={`sections.${sectionIndex}.times.${timeIndex}.hour`}
                                        label="שעה"
                                        placeholder="08:00"
                                        value={time.hour}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={
                                          touched.sections?.[sectionIndex]
                                            ?.times?.[timeIndex]?.hour &&
                                          Boolean(
                                            (errors.sections as any)?.[
                                              sectionIndex
                                            ]?.times?.[timeIndex]?.hour
                                          )
                                        }
                                      />

                                      <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        name={`sections.${sectionIndex}.times.${timeIndex}.displayOrder`}
                                        label="סדר"
                                        value={time.displayOrder}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />
                                    </Box>

                                    <Box
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                          xs: "1fr",
                                          sm: "3fr 1fr",
                                        },
                                        gap: 1,
                                        mt: 1,
                                      }}
                                    >
                                      <TextField
                                        fullWidth
                                        size="small"
                                        name={`sections.${sectionIndex}.times.${timeIndex}.notes`}
                                        label="הערות"
                                        value={time.notes}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                      />

                                      <FormControlLabel
                                        control={
                                          <Switch
                                            checked={time.enabled}
                                            onChange={handleChange}
                                            name={`sections.${sectionIndex}.times.${timeIndex}.enabled`}
                                          />
                                        }
                                        label="פעיל"
                                      />
                                    </Box>
                                  </Box>
                                ))}

                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() =>
                                    pushTime({
                                      title: "",
                                      hour: "",
                                      displayOrder: section.times.length,
                                      enabled: true,
                                      notes: "",
                                    })
                                  }
                                >
                                  הוסף זמן
                                </Button>
                              </Stack>
                            )}
                          </FieldArray>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      pushSection({
                        title: "",
                        displayOrder: values.sections.length,
                        enabled: true,
                        notes: "",
                        times: [
                          {
                            title: "",
                            hour: "",
                            displayOrder: 0,
                            enabled: true,
                            notes: "",
                          },
                        ],
                      })
                    }
                  >
                    הוסף מדור
                  </Button>
                </Stack>
              )}
            </FieldArray>
          </Stack>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <Button onClick={onCancel}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formIsSubmitting || isSubmitting}
            >
              {formIsSubmitting || isSubmitting ? "שומר..." : "שמור"}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

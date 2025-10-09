import React from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { ToraLesson } from "../model/ToraLessons";

interface ToraLessonFormValues {
  title: string;
  ledBy: string;
  when: string;
  displayOrder: number;
  enabled: boolean;
  notes: string;
}

interface ToraLessonsFormProps {
  toraLesson?: ToraLesson | null;
  onSubmit: (values: ToraLessonFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const toraLessonValidationSchema = Yup.object().shape({
  title: Yup.string().required("כותרת היא שדה חובה"),
  ledBy: Yup.string().required("מעביר השיעור הוא שדה חובה"),
  when: Yup.string().required("מועד השיעור הוא שדה חובה"),
  displayOrder: Yup.number()
    .min(0, "סדר תצוגה חייב להיות מספר חיובי")
    .required("סדר תצוגה הוא שדה חובה"),
  enabled: Yup.boolean(),
  notes: Yup.string(),
});

const getInitialFormValues = (
  toraLesson?: ToraLesson | null
): ToraLessonFormValues => {
  if (toraLesson) {
    return {
      title: toraLesson.title,
      ledBy: toraLesson.ledBy,
      when: toraLesson.when,
      displayOrder: toraLesson.displayOrder,
      enabled: toraLesson.enabled,
      notes: toraLesson.notes || "",
    };
  }

  return {
    title: "",
    ledBy: "",
    when: "",
    displayOrder: 1,
    enabled: true,
    notes: "",
  };
};

const ToraLessonsForm: React.FC<ToraLessonsFormProps> = ({
  toraLesson,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <Formik
      initialValues={getInitialFormValues(toraLesson)}
      validationSchema={toraLessonValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
      }) => (
        <Form>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              fullWidth
              label="כותרת השיעור"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              required
            />

            {/* Led By */}
            <TextField
              fullWidth
              label="מעביר השיעור"
              name="ledBy"
              value={values.ledBy}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.ledBy && Boolean(errors.ledBy)}
              helperText={touched.ledBy && errors.ledBy}
              required
            />

            {/* When */}
            <TextField
              fullWidth
              label="מועד השיעור"
              name="when"
              value={values.when}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.when && Boolean(errors.when)}
              helperText={touched.when && errors.when}
              placeholder='לדוגמה: "כל יום שני בשעה 20:00"'
              required
            />

            {/* Display Order */}
            <TextField
              fullWidth
              label="סדר תצוגה"
              name="displayOrder"
              type="number"
              value={values.displayOrder}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.displayOrder && Boolean(errors.displayOrder)}
              helperText={touched.displayOrder && errors.displayOrder}
              required
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="הערות"
              name="notes"
              value={values.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.notes && Boolean(errors.notes)}
              helperText={touched.notes && errors.notes}
              multiline
              rows={3}
            />

            {/* Enabled Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={values.enabled}
                  onChange={e => setFieldValue("enabled", e.target.checked)}
                  name="enabled"
                />
              }
              label="פעיל"
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                onClick={onCancel}
                disabled={isSubmitting}
                variant="outlined"
              >
                ביטול
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "שומר..." : "שמור"}
              </Button>
            </Box>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};

export default ToraLessonsForm;

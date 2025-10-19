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
import { Donation } from "../model/Donation";

interface DonationFormValues {
  title: string;
  link: string;
  notes: string;
  displayOrder: number;
  enabled: boolean;
}

interface DonationFormSubmitValues {
  title: string;
  link: string | undefined;
  notes: string;
  displayOrder: number;
  enabled: boolean;
}

interface DonationFormProps {
  donation?: Donation | null;
  onSubmit: (values: DonationFormSubmitValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const donationValidationSchema = Yup.object().shape({
  title: Yup.string().required("כותרת היא שדה חובה"),
  link: Yup.string()
    .nullable()
    .notRequired()
    .test("url-or-empty", "יש להזין כתובת URL תקינה", function (value) {
      if (!value || value.trim() === "") {
        return true; // Allow empty values
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  notes: Yup.string(),
  displayOrder: Yup.number()
    .min(0, "סדר תצוגה חייב להיות מספר חיובי")
    .required("סדר תצוגה הוא שדה חובה"),
  enabled: Yup.boolean(),
});

const getInitialFormValues = (
  donation?: Donation | null
): DonationFormValues => {
  if (donation) {
    return {
      title: donation.title,
      link: donation.link || "",
      notes: donation.notes || "",
      displayOrder: donation.displayOrder,
      enabled: donation.enabled,
    };
  }

  return {
    title: "",
    link: "",
    notes: "",
    displayOrder: 1,
    enabled: true,
  };
};

const DonationForm: React.FC<DonationFormProps> = ({
  donation,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <Formik<DonationFormValues>
      initialValues={getInitialFormValues(donation)}
      validationSchema={donationValidationSchema}
      onSubmit={async values => {
        // Convert empty string to undefined for the link field
        const transformedValues: DonationFormSubmitValues = {
          ...values,
          link:
            values.link && values.link.trim() !== ""
              ? values.link.trim()
              : undefined,
        };
        await onSubmit(transformedValues);
      }}
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
              label="כותרת"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              required
            />

            {/* Link */}
            <TextField
              fullWidth
              label="קישור לתרומה (אופציונלי)"
              name="link"
              value={values.link}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.link && Boolean(errors.link)}
              helperText={
                touched.link && errors.link
                  ? errors.link
                  : "אופציונלי - ניתן להשאיר ריק עבור העברות בנקאיות. לדוגמה: https://payboxapp.page.link/..."
              }
              placeholder="https://... (אופציונלי)"
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

export default DonationForm;

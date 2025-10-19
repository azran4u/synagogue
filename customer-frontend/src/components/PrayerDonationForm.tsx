import React from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { PrayerDonation } from "../model/PrayerDonation";
import { HebrewDate } from "../model/HebrewDate";
import { HebrewDateSelector } from "./HebrewDateSelector";

interface PrayerDonationFormValues {
  amount: number;
  hebrewDate: HebrewDate;
  paid: boolean;
  notes: string;
}

interface PrayerDonationFormProps {
  donation?: PrayerDonation | null;
  onSubmit: (values: PrayerDonationFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  open: boolean;
  title: string;
}

const prayerDonationValidationSchema = Yup.object().shape({
  amount: Yup.number()
    .min(1, "סכום חייב להיות לפחות 1")
    .required("סכום הוא שדה חובה"),
  hebrewDate: Yup.mixed<HebrewDate>()
    .required("תאריך הוא שדה חובה")
    .test(
      "is-hebrew-date",
      "תאריך חייב להיות תקין",
      value => value instanceof HebrewDate
    ),
  paid: Yup.boolean(),
  notes: Yup.string(),
});

export const PrayerDonationForm: React.FC<PrayerDonationFormProps> = ({
  donation,
  onSubmit,
  onCancel,
  isSubmitting,
  open,
  title,
}) => {
  const getInitialValues = (
    donation?: PrayerDonation | null
  ): PrayerDonationFormValues => {
    if (donation) {
      return {
        amount: donation.amount,
        hebrewDate: donation.hebrewDate,
        paid: donation.paid,
        notes: donation.notes || "",
      };
    }
    return {
      amount: 0,
      hebrewDate: HebrewDate.now(),
      paid: false,
      notes: "",
    };
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Formik
        initialValues={getInitialValues(donation)}
        validationSchema={prayerDonationValidationSchema}
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
            <DialogContent>
              <Stack spacing={3}>
                <TextField
                  label="סכום (₪)"
                  name="amount"
                  type="number"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.amount && Boolean(errors.amount)}
                  helperText={
                    touched.amount && errors.amount
                      ? errors.amount
                      : "הזן את סכום התרומה"
                  }
                  fullWidth
                  inputProps={{ min: 1 }}
                />

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    תאריך
                  </Typography>
                  <HebrewDateSelector
                    value={values.hebrewDate}
                    onChange={(date: HebrewDate | null) =>
                      setFieldValue("hebrewDate", date || HebrewDate.now())
                    }
                    label="תאריך התרומה/חוב"
                  />
                  {touched.hebrewDate && errors.hebrewDate && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 1, display: "block" }}
                    >
                      {errors.hebrewDate as string}
                    </Typography>
                  )}
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      name="paid"
                      checked={values.paid}
                      onChange={handleChange}
                    />
                  }
                  label="שולם"
                />

                <TextField
                  label="הערות"
                  name="notes"
                  multiline
                  rows={3}
                  value={values.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={
                    touched.notes && errors.notes
                      ? errors.notes
                      : "הערות נוספות (אופציונלי)"
                  }
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={onCancel} disabled={isSubmitting}>
                ביטול
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "שומר..." : "שמור"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

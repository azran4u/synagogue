import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { AliyaGroup } from "../model/AliyaGroup";
import { HebrewDate } from "../model/HebrewDate";
import { HebrewDateSelector } from "./HebrewDateSelector";
import { useCreateAliyaGroup } from "../hooks/useAliyaGroups";

export interface AliyaGroupFormValues {
  label: string;
  hebrewDate: HebrewDate | null;
}

export const aliyaGroupValidationSchema = Yup.object({
  label: Yup.string().required("תווית קבוצה נדרשת"),
  hebrewDate: Yup.object().required("תאריך עברי נדרש"),
});

interface CreateAliyaGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateAliyaGroupDialog: React.FC<CreateAliyaGroupDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const createAliyaGroupMutation = useCreateAliyaGroup();

  const initialFormValues: AliyaGroupFormValues = {
    label: "",
    hebrewDate: null,
  };

  const handleSubmit = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    try {
      const newGroup = AliyaGroup.create(values.label, values.hebrewDate!);
      await createAliyaGroupMutation.mutateAsync(newGroup);
      onClose();
      onSuccess?.();
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya group:", error);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>הוסף קבוצת עליות חדשה</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={initialFormValues}
          validationSchema={aliyaGroupValidationSchema}
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
                <TextField
                  name="label"
                  label="תווית קבוצה"
                  value={values.label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.label && Boolean(errors.label)}
                  helperText={touched.label && errors.label}
                  fullWidth
                />

                <HebrewDateSelector
                  value={values.hebrewDate}
                  onChange={date => setFieldValue("hebrewDate", date)}
                  label="תאריך עברי"
                />
              </Stack>

              <DialogActions>
                <Button type="button" onClick={onClose}>
                  ביטול
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || createAliyaGroupMutation.isPending}
                >
                  {isSubmitting || createAliyaGroupMutation.isPending
                    ? "יוצר..."
                    : "צור קבוצה"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

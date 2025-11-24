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
import {
  useCreateAliyaGroup,
  useUpdateAliyaGroup,
} from "../hooks/useAliyaGroups";

export interface AliyaGroupFormValues {
  label: string;
  hebrewDate: HebrewDate | null;
}

export const aliyaGroupValidationSchema = Yup.object({
  label: Yup.string().required("תווית קבוצה נדרשת"),
  hebrewDate: Yup.object().required("תאריך עברי נדרש"),
});

const getInitialFormValues = (
  aliyaGroup?: AliyaGroup | null
): AliyaGroupFormValues => {
  if (aliyaGroup) {
    return {
      label: aliyaGroup.label,
      hebrewDate: aliyaGroup.hebrewDate,
    };
  }

  return {
    label: "",
    hebrewDate: null,
  };
};

interface CreateAliyaGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  aliyaGroup?: AliyaGroup | null;
}

export const CreateAliyaGroupDialog: React.FC<CreateAliyaGroupDialogProps> = ({
  open,
  onClose,
  onSuccess,
  aliyaGroup,
}) => {
  const createAliyaGroupMutation = useCreateAliyaGroup();
  const updateAliyaGroupMutation = useUpdateAliyaGroup();

  const isEditMode = !!aliyaGroup;

  const handleSubmit = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    try {
      if (isEditMode && aliyaGroup) {
        // Edit mode
        const updatedGroup = aliyaGroup.update({
          label: values.label,
          hebrewDate: values.hebrewDate!,
        });
        await updateAliyaGroupMutation.mutateAsync(updatedGroup);
      } else {
        // Create mode
        const newGroup = AliyaGroup.create(values.label, values.hebrewDate!);
        await createAliyaGroupMutation.mutateAsync(newGroup);
      }
      onClose();
      onSuccess?.();
      setSubmitting(false);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} aliya group:`,
        error
      );
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "ערוך פרטי קבוצה" : "הוסף קבוצת עליות חדשה"}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={getInitialFormValues(aliyaGroup)}
          validationSchema={aliyaGroupValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
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
                  disabled={
                    isSubmitting ||
                    (isEditMode
                      ? updateAliyaGroupMutation.isPending
                      : createAliyaGroupMutation.isPending)
                  }
                >
                  {isSubmitting ||
                  (isEditMode
                    ? updateAliyaGroupMutation.isPending
                    : createAliyaGroupMutation.isPending)
                    ? isEditMode
                      ? "מעדכן..."
                      : "יוצר..."
                    : isEditMode
                      ? "עדכן קבוצה"
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

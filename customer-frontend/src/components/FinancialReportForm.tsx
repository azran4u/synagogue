import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FinancialReport } from "../model/FinancialReports";
import { HebrewDate } from "../model/HebrewDate";
import { HebrewDateSelector } from "./HebrewDateSelector";

interface FinancialReportFormValues {
  title: string;
  content: string;
  displayOrder: number;
  enabled: boolean;
  linkToDocument: string;
  hebrewDate: HebrewDate;
}

interface FinancialReportFormProps {
  report?: FinancialReport | null;
  onSubmit: (
    values: FinancialReportFormValues,
    file: File | null
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const financialReportValidationSchema = Yup.object().shape({
  title: Yup.string().required("כותרת היא שדה חובה"),
  content: Yup.string().required("תיאור הוא שדה חובה"),
  displayOrder: Yup.number()
    .min(0, "סדר תצוגה חייב להיות מספר חיובי")
    .required("סדר תצוגה הוא שדה חובה"),
  enabled: Yup.boolean(),
  linkToDocument: Yup.string(),
});

const getInitialFormValues = (
  report?: FinancialReport | null
): FinancialReportFormValues => {
  if (report) {
    return {
      title: report.title,
      content: report.content,
      displayOrder: report.displayOrder,
      enabled: report.enabled,
      linkToDocument: report.linkToDocument,
      hebrewDate: report.hebrewDate,
    };
  }

  return {
    title: "",
    content: "",
    displayOrder: 1,
    enabled: true,
    linkToDocument: "",
    hebrewDate: HebrewDate.now(),
  };
};

const FinancialReportForm: React.FC<FinancialReportFormProps> = ({
  report,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError("הקובץ גדול מדי. גודל מקסימלי: 10MB");
        setSelectedFile(null);
        return;
      }
      setFileError("");
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError("");
  };

  const handleFormSubmit = async (values: FinancialReportFormValues) => {
    // If editing and no new file selected, must have existing document
    if (report && !selectedFile && !values.linkToDocument) {
      setFileError("יש להעלות מסמך");
      return;
    }

    // If creating, must have a file
    if (!report && !selectedFile) {
      setFileError("יש להעלות מסמך");
      return;
    }

    await onSubmit(values, selectedFile);
  };

  return (
    <Formik
      initialValues={getInitialFormValues(report)}
      validationSchema={financialReportValidationSchema}
      onSubmit={handleFormSubmit}
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
              label="כותרת הדו״ח"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
              required
            />

            {/* Content */}
            <TextField
              fullWidth
              label="תיאור הדו״ח"
              name="content"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.content && Boolean(errors.content)}
              helperText={touched.content && errors.content}
              multiline
              rows={4}
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

            {/* Hebrew Date */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                תאריך עברי
              </Typography>
              <HebrewDateSelector
                value={values.hebrewDate}
                onChange={(date: HebrewDate | null) =>
                  setFieldValue("hebrewDate", date || HebrewDate.now())
                }
              />
            </Box>

            {/* File Upload */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                מסמך (PDF, Word, Excel, וכו')
              </Typography>

              {/* Existing file indicator */}
              {report && report.linkToDocument && !selectedFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FileIcon />
                    <Typography variant="body2">
                      מסמך קיים מועלה. ניתן להעלות מסמך חדש להחלפה.
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* File input */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={isSubmitting}
                >
                  {selectedFile ? "החלף קובץ" : "בחר קובץ"}
                  <input
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                </Button>

                {selectedFile && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <FileIcon color="primary" />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {selectedFile.name} (
                      {(selectedFile.size / 1024).toFixed(2)} KB)
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {fileError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {fileError}
                </Alert>
              )}

              {!report && !selectedFile && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  * שדה חובה
                </Typography>
              )}
            </Box>

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

            {/* Progress indicator */}
            {isSubmitting && <LinearProgress />}

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

export default FinancialReportForm;

import React, { useState } from "react";
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
  IconButton,
  Chip,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { AliyaTypeCategory } from "../model/AliyaTypeCategory";
import { AliyaType } from "../model/AliyaType";
import {
  useAliyaTypeCategories,
  useCreateAliyaTypeCategory,
  useDeleteAliyaTypeCategory,
  useUpdateAliyaTypeCategory,
} from "../hooks/useAliyaTypeCategories";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface AliyaTypeCategoryFormValues {
  name: string;
  description: string;
  displayOrder: number;
  aliyaTypeIds: string[];
}

const validationSchema = Yup.object({
  name: Yup.string()
    .required("שם הקטגוריה נדרש")
    .min(2, "שם הקטגוריה חייב להכיל לפחות 2 תווים"),
  description: Yup.string().optional(),
  displayOrder: Yup.number()
    .integer("סדר התצוגה חייב להיות מספר שלם")
    .min(0, "סדר התצוגה חייב להיות מספר חיובי")
    .required("סדר התצוגה נדרש"),
});

const AdminAliyaTypeCategoriesContent = () => {
  const navigate = useSynagogueNavigate();
  const { isGabaiOrHigher } = useUser();

  // State for dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AliyaTypeCategory | null>(null);

  // Data fetching
  const { data: categories, isLoading, error } = useAliyaTypeCategories();
  const { data: aliyaTypes } = useAliyaTypes();

  // Mutations
  const createMutation = useCreateAliyaTypeCategory();
  const updateMutation = useUpdateAliyaTypeCategory();
  const deleteMutation = useDeleteAliyaTypeCategory();

  // Initial form values
  const initialFormValues: AliyaTypeCategoryFormValues = {
    name: "",
    description: "",
    displayOrder: 0,
    aliyaTypeIds: [],
  };

  // Handlers
  const handleCreateCategory = async (
    values: AliyaTypeCategoryFormValues,
    { setSubmitting }: FormikHelpers<AliyaTypeCategoryFormValues>
  ) => {
    try {
      const newCategory = AliyaTypeCategory.create(
        values.name,
        values.description || undefined,
        values.displayOrder,
        values.aliyaTypeIds
      );

      await createMutation.mutateAsync(newCategory);
      setShowCreateDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating category:", error);
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (
    values: AliyaTypeCategoryFormValues,
    { setSubmitting }: FormikHelpers<AliyaTypeCategoryFormValues>
  ) => {
    if (!editingCategory) return;

    try {
      const updatedCategory = editingCategory.update({
        name: values.name,
        description: values.description || undefined,
        displayOrder: values.displayOrder,
        aliyaTypeIds: values.aliyaTypeIds,
      });

      await updateMutation.mutateAsync(updatedCategory);
      setShowEditDialog(false);
      setEditingCategory(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating category:", error);
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: AliyaTypeCategory) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את "${category.name}"? הקטגוריה תוסר מכל סוגי העליות שמשתמשים בה.`
      )
    ) {
      try {
        await deleteMutation.mutateAsync(category.id);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleEditCategory = (category: AliyaTypeCategory) => {
    setEditingCategory(category);
    setShowEditDialog(true);
  };

  const handleBackToHome = () => {
    navigate("");
  };

  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          אין לך הרשאות גישה לדף זה. רק מנהלים יכולים לגשת לניהול קטגוריות
          עליות.
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען קטגוריות...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          שגיאה בטעינת הקטגוריות. אנא נסה שוב מאוחר יותר.
        </Alert>
      </Box>
    );
  }

  // Sort by display order
  const sortedCategories = [...(categories || [])].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      {/* Header */}
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
          component="h1"
          sx={{
            textAlign: "center",
            order: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          ניהול קטגוריות עליות
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 2 },
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            הוסף קטגוריה
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleBackToHome}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            חזרה
          </Button>
        </Box>
      </Box>

      {/* Categories List */}
      {sortedCategories.length === 0 ? (
        <Alert severity="info">
          אין קטגוריות. לחץ על "הוסף קטגוריה" כדי ליצור קטגוריה חדשה.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {sortedCategories.map(category => (
            <Card key={category.id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CategoryIcon color="primary" />
                      <Typography variant="h6">{category.name}</Typography>
                      {category.displayOrder !== undefined && (
                        <Chip
                          label={`סדר: ${category.displayOrder}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {category.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {category.description}
                      </Typography>
                    )}
                    {category.aliyaTypeIds.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          סוגי עליות:
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {category.aliyaTypeIds.map(typeId => {
                            const aliyaType = aliyaTypes?.find(
                              t => t.id === typeId
                            );
                            return aliyaType ? (
                              <Chip
                                key={typeId}
                                label={aliyaType.displayName}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            ) : null;
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditCategory(category)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCategory(category)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleCreateCategory}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <DialogTitle>הוסף קטגוריה חדשה</DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField
                    name="name"
                    label="שם הקטגוריה"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    fullWidth
                    required
                  />
                  <TextField
                    name="description"
                    label="תיאור (אופציונלי)"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <TextField
                    name="displayOrder"
                    label="סדר תצוגה"
                    type="number"
                    value={values.displayOrder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.displayOrder && !!errors.displayOrder}
                    helperText={touched.displayOrder && errors.displayOrder}
                    fullWidth
                    required
                  />
                  <Autocomplete
                    multiple
                    options={aliyaTypes || []}
                    getOptionLabel={option => option.displayName}
                    value={(aliyaTypes || []).filter(type =>
                      values.aliyaTypeIds.includes(type.id)
                    )}
                    onChange={(event, newValue) => {
                      setFieldValue(
                        "aliyaTypeIds",
                        newValue.map(type => type.id)
                      );
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="סוגי עליות"
                        helperText="בחר את סוגי העליות שייכים לקטגוריה זו"
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...chipProps } = getTagProps({ index });
                        return (
                          <Chip
                            {...chipProps}
                            key={key}
                            label={option.displayName}
                          />
                        );
                      })
                    }
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowCreateDialog(false)}>בטל</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  הוסף
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Edit Dialog */}
      {editingCategory && (
        <Dialog
          open={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingCategory(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <Formik
            initialValues={{
              name: editingCategory.name,
              description: editingCategory.description || "",
              displayOrder: editingCategory.displayOrder || 0,
              aliyaTypeIds: editingCategory.aliyaTypeIds || [],
            }}
            validationSchema={validationSchema}
            onSubmit={handleUpdateCategory}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              setFieldValue,
            }) => (
              <Form onSubmit={handleSubmit}>
                <DialogTitle>ערוך קטגוריה</DialogTitle>
                <DialogContent>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      name="name"
                      label="שם הקטגוריה"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                      fullWidth
                      required
                    />
                    <TextField
                      name="description"
                      label="תיאור (אופציונלי)"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.description && !!errors.description}
                      helperText={touched.description && errors.description}
                      fullWidth
                      multiline
                      rows={2}
                    />
                    <TextField
                      name="displayOrder"
                      label="סדר תצוגה"
                      type="number"
                      value={values.displayOrder}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.displayOrder && !!errors.displayOrder}
                      helperText={touched.displayOrder && errors.displayOrder}
                      fullWidth
                      required
                    />
                    <Autocomplete
                      multiple
                      options={aliyaTypes || []}
                      getOptionLabel={option => option.displayName}
                      value={(aliyaTypes || []).filter(type =>
                        values.aliyaTypeIds.includes(type.id)
                      )}
                      onChange={(event, newValue) => {
                        setFieldValue(
                          "aliyaTypeIds",
                          newValue.map(type => type.id)
                        );
                      }}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="סוגי עליות"
                          helperText="בחר את סוגי העליות שייכים לקטגוריה זו"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...chipProps } = getTagProps({ index });
                          return (
                            <Chip
                              {...chipProps}
                              key={key}
                              label={option.displayName}
                            />
                          );
                        })
                      }
                    />
                  </Stack>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditingCategory(null);
                    }}
                  >
                    בטל
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    שמור
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
      )}
    </Box>
  );
};

export default function AdminAliyaTypeCategoriesPage() {
  return (
    <Box>
      <AdminAliyaTypeCategoriesContent />
    </Box>
  );
}

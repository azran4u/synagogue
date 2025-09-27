import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Container,
  Chip,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { Synagogue } from "../model/Synagogue";
import {
  useCreateSynagogue,
  useAllSynagogues,
  useDeleteSynagogue,
} from "../hooks/useSynagogues";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { Formik, FormikHelpers, Form, Field } from "formik";
import { useAuth } from "../hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { synagogueActions } from "../store/synagogueSlice";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";

// this page is used to list all the synagogues
// and allows the user to select a synagogue
// and navigate to the synagogue page
// an admin can also create a new synagogue
const SynagoguesPage: React.FC = () => {
  const { data: synagogues, isLoading, error } = useAllSynagogues();
  const { mutate: createSynagogue } = useCreateSynagogue();
  const { mutate: deleteSynagogue } = useDeleteSynagogue();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedSynagogue = useSelectedSynagogue();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [synagogueToDelete, setSynagogueToDelete] = useState<Synagogue | null>(
    null
  );

  const handleSynagogueClick = (synId: string) => {
    dispatch(
      synagogueActions.setSelectedSynagogue({
        id: synId,
      })
    );
    navigate(`/synagogue/${synId}`);
  };

  const handleDeleteClick = (synagogue: Synagogue, event: React.MouseEvent) => {
    event.stopPropagation();
    setSynagogueToDelete(synagogue);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (synagogueToDelete) {
      deleteSynagogue(synagogueToDelete.id);
      setDeleteDialogOpen(false);
      setSynagogueToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSynagogueToDelete(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת רשימת בתי הכנסת: {error.message}
        </Alert>
      </Container>
    );
  }

  if (!synagogues || synagogues.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <BusinessIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              לא נמצאו בתי כנסת
            </Typography>
            <Typography variant="body1" color="text.secondary">
              עדיין לא נוספו בתי כנסת למערכת
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  function handleCreateSynagogue(
    values: { name: string },
    formikHelpers: FormikHelpers<{ name: string }>
  ): void | Promise<any> {
    createSynagogue(Synagogue.create(values.name, user?.uid ?? ""));
  }

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          בתי כנסת
        </Typography>
        <Typography variant="body1" color="text.secondary">
          בחר בית כנסת מהרשימה להמשך
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <List>
            {synagogues.map((synagogue, index) => (
              <ListItem
                key={synagogue.id}
                divider={index < synagogues.length - 1}
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleSynagogueClick(synagogue.id)}
                  sx={{ py: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <BusinessIcon
                      sx={{ fontSize: 32, color: "primary.main", mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {synagogue.name}
                      </Typography>
                      {isAdmin && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          מזהה: {synagogue.id}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        נוצר ב: {synagogue.formattedCreatedAt}
                      </Typography>
                    </Box>
                    {isAdmin && (
                      <IconButton
                        onClick={event => handleDeleteClick(synagogue, event)}
                        sx={{ ml: 1 }}
                        title="מחק בית כנסת"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* if isAdmin create a button to create a new synagogue */}
      {isAdmin && (
        <Box sx={{ mt: 3 }}>
          <Formik initialValues={{ name: "" }} onSubmit={handleCreateSynagogue}>
            {({ values, handleChange, handleBlur }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    name="name"
                    label="שם בית הכנסת"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                  />
                </Box>
                <Button type="submit" variant="contained">
                  הוסף בית כנסת
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      )}

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          סה"כ {synagogues.length} בתי כנסת
        </Typography>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">מחק בית כנסת</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            האם אתה בטוח שברצונך למחוק את בית הכנסת "{synagogueToDelete?.name}"?
            פעולה זו לא ניתנת לביטול.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            ביטול
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SynagoguesPage;

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import {
  useDonations,
  useCreateDonation,
  useUpdateDonation,
  useDeleteDonation,
} from "../hooks/useDonations";
import { useUser } from "../hooks/useUser";
import { Donation } from "../model/Donation";
import DonationForm from "../components/DonationForm";
import { WithLogin } from "../components/WithLogin";

interface DonationFormSubmitValues {
  title: string;
  link: string | undefined;
  notes: string;
  displayOrder: number;
  enabled: boolean;
}

const AdminDonationsContent: React.FC = () => {
  const { data: donations, isLoading, error } = useDonations();
  const createDonation = useCreateDonation();
  const updateDonation = useUpdateDonation();
  const deleteDonation = useDeleteDonation();
  const { isGabaiOrHigher, email } = useUser();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(
    null
  );

  // Check permissions
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  const handleOpenDialog = (donation?: Donation) => {
    setEditingDonation(donation || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDonation(null);
  };

  const handleSubmit = async (values: DonationFormSubmitValues) => {
    try {
      if (editingDonation) {
        // Update existing donation
        const updatedDonation = editingDonation.update(values);
        await updateDonation.mutateAsync(updatedDonation);
      } else {
        // Create new donation
        const newDonation = Donation.create(
          values.title,
          values.link,
          email || "unknown",
          values.displayOrder,
          values.enabled,
          values.notes
        );
        // Set enabled status
        await createDonation.mutateAsync(newDonation);
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save donation:", error);
    }
  };

  const handleOpenDeleteDialog = (donation: Donation) => {
    setDonationToDelete(donation);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDonationToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (donationToDelete) {
      try {
        await deleteDonation.mutateAsync(donationToDelete.id);
        handleCloseDeleteDialog();
      } catch (error) {
        console.error("Failed to delete donation:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">שגיאה בטעינת תרומות: {error.message}</Alert>
      </Box>
    );
  }

  const sortedDonations = donations
    ? [...donations].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">ניהול תרומות</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף דרך תרומה
        </Button>
      </Box>

      {/* Donations List */}
      {sortedDonations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <MoneyIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין דרכי תרומה
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הוסף דרך תרומה ראשונה
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sortedDonations.map(donation => (
            <Card key={donation.id} elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6">{donation.title}</Typography>
                      <Chip
                        label={donation.enabled ? "פעיל" : "לא פעיל"}
                        color={donation.enabled ? "success" : "default"}
                        size="small"
                      />
                      <Chip
                        label={`סדר: ${donation.displayOrder}`}
                        size="small"
                        variant="outlined"
                      />
                      {donation.isExternalPayment && (
                        <Chip
                          label={donation.paymentServiceName}
                          size="small"
                          color="info"
                        />
                      )}
                    </Box>

                    {donation.hasLink ? (
                      <Link
                        href={donation.link!}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1,
                          wordBreak: "break-all",
                        }}
                      >
                        <Typography variant="body2" color="primary">
                          {donation.link}
                        </Typography>
                        <OpenIcon fontSize="small" />
                      </Link>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        ללא קישור
                      </Typography>
                    )}

                    {donation.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {donation.notesPreview}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 1 }}
                    >
                      נוצר על ידי: {donation.createdBy}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <Tooltip title="ערוך">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(donation)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(donation)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDonation ? "ערוך דרך תרומה" : "הוסף דרך תרומה"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <DonationForm
              donation={editingDonation}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              isSubmitting={
                createDonation.isPending || updateDonation.isPending
              }
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>מחק דרך תרומה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את "{donationToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleteDonation.isPending}
          >
            ביטול
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteDonation.isPending}
            startIcon={
              deleteDonation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteDonation.isPending ? "מוחק..." : "מחק"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AdminDonationsPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminDonationsContent />
    </WithLogin>
  );
};

export default AdminDonationsPage;

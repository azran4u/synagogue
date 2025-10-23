import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete,
  TextField,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useUpdatePrayerCard } from "../hooks/usePrayerCard";
import {
  useDonationStatistics,
  useAllDonationsAcrossPrayers,
} from "../hooks/usePrayerDonations";
import { useUser } from "../hooks/useUser";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { PrayerCard } from "../model/Prayer";
import { PrayerDonation } from "../model/PrayerDonation";
import { PrayerDonationForm } from "../components/PrayerDonationForm";
import { WithLogin } from "../components/WithLogin";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { formatCurrency, DonationWithContext } from "../utils/donationStats";
import { format } from "date-fns";
import { HebrewDate } from "../model/HebrewDate";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { HebrewDateSelector } from "../components/HebrewDateSelector";

interface PrayerOption {
  id: string;
  label: string;
  prayerCard: PrayerCard;
  isChild: boolean;
}

interface PrayerDonationFormValues {
  amount: number;
  hebrewDate: HebrewDate;
  paid: boolean;
  notes: string;
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

const AdminPrayerDonationsContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const updatePrayerCard = useUpdatePrayerCard();
  const { isGabaiOrHigher, email } = useUser();
  const { data: synagogue } = useSelectedSynagogue();
  const navigate = useSynagogueNavigate();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<{
    donation: PrayerDonation;
    prayerCard: PrayerCard;
    prayerId: string;
  } | null>(null);
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Unpaid, 2: Paid
  const [sortBy, setSortBy] = useState<"date" | "amount" | "prayer">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    totalUnpaid,
    totalPaid,
    prayersWithUnpaidCount,
    unpaidDonationsCount,
  } = useDonationStatistics(prayerCards);
  const allDonationsWithContext = useAllDonationsAcrossPrayers(prayerCards);

  // Create prayer options for the autocomplete
  const prayerOptions = useMemo((): PrayerOption[] => {
    if (!prayerCards) return [];

    const options: PrayerOption[] = [];

    prayerCards.forEach(prayerCard => {
      // Add main prayer if age 13+
      if (prayerCard.prayer.hebrewBirthDate) {
        if (prayerCard.prayer.hebrewBirthDate.isOlderThan(13)) {
          options.push({
            id: prayerCard.prayer.id,
            label: `${prayerCard.prayer.fullName} (מתפלל ראשי)`,
            prayerCard,
            isChild: false,
          });
        }
      } else {
        // If no birthdate, assume adult
        options.push({
          id: prayerCard.prayer.id,
          label: `${prayerCard.prayer.fullName} (מתפלל ראשי)`,
          prayerCard,
          isChild: false,
        });
      }

      // Add children if age 13+
      prayerCard.children.forEach(child => {
        if (child.hebrewBirthDate) {
          if (child.hebrewBirthDate.isOlderThan(13)) {
            options.push({
              id: child.id,
              label: `${child.fullName} (ילד של ${prayerCard.prayer.fullName})`,
              prayerCard,
              isChild: true,
            });
          }
        }
      });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [prayerCards]);

  // Filter and sort donations
  const filteredAndSortedDonations = useMemo(() => {
    let filtered = allDonationsWithContext;

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(item => !item.donation.paid);
    } else if (activeTab === 2) {
      filtered = filtered.filter(item => item.donation.paid);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "date":
          aValue = a.donation.hebrewDate.toGregorianDate().getTime();
          bValue = b.donation.hebrewDate.toGregorianDate().getTime();
          break;
        case "amount":
          aValue = a.donation.amount;
          bValue = b.donation.amount;
          break;
        case "prayer":
          aValue = a.prayer.fullName;
          bValue = b.prayer.fullName;
          break;
        default:
          return 0;
      }

      if (sortBy === "prayer") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [allDonationsWithContext, activeTab, sortBy, sortOrder]);

  // Group donations by prayer
  const donationsByPrayer = useMemo(() => {
    const grouped = new Map<string, DonationWithContext[]>();

    filteredAndSortedDonations.forEach(item => {
      const key = item.prayer.id;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    return grouped;
  }, [filteredAndSortedDonations]);

  const handleAddDonation = async (values: PrayerDonationFormValues) => {
    if (!selectedPrayerId || !prayerCards || !email) return;

    // Find the prayer and prayer card
    const prayerOption = prayerOptions.find(opt => opt.id === selectedPrayerId);
    if (!prayerOption) return;

    const prayer = prayerOption.isChild
      ? prayerOption.prayerCard.children.find(
          child => child.id === selectedPrayerId
        )
      : prayerOption.prayerCard.prayer;

    if (!prayer) return;

    // Create new donation
    const newDonation = PrayerDonation.create(
      values.amount,
      values.hebrewDate,
      email,
      values.paid,
      values.notes || undefined
    );

    // Update the prayer
    const updatedPrayer = prayer.addDonation(newDonation);

    // Update the prayer card
    const updatedPrayerCard = new PrayerCard(
      prayerOption.prayerCard.id,
      prayerOption.isChild ? prayerOption.prayerCard.prayer : updatedPrayer,
      prayerOption.isChild
        ? prayerOption.prayerCard.children.map(child =>
            child.id === selectedPrayerId ? updatedPrayer : child
          )
        : prayerOption.prayerCard.children
    );

    await updatePrayerCard.mutateAsync(updatedPrayerCard);
    setIsAddDialogOpen(false);
    setSelectedPrayerId("");
  };

  const handleEditDonation = async (values: PrayerDonationFormValues) => {
    if (!editingDonation || !email) return;

    const { donation, prayerCard, prayerId } = editingDonation;

    // Find the prayer in the current prayer card
    const prayer = prayerId.includes("child")
      ? prayerCard.children.find(child => child.id === prayerId)
      : prayerCard.prayer;

    if (!prayer) return;

    // Update the donation
    const updatedPrayer = prayer.updateDonation(donation.id, {
      amount: values.amount,
      hebrewDate: values.hebrewDate,
      paid: values.paid,
      notes: values.notes || undefined,
    });

    // Update the prayer card
    const updatedPrayerCard = new PrayerCard(
      prayerCard.id,
      prayerId.includes("child") ? prayerCard.prayer : updatedPrayer,
      prayerId.includes("child")
        ? prayerCard.children.map(child =>
            child.id === prayerId ? updatedPrayer : child
          )
        : prayerCard.children
    );

    await updatePrayerCard.mutateAsync(updatedPrayerCard);
    setEditingDonation(null);
  };

  const handleDeleteDonation = async (
    donation: PrayerDonation,
    prayerCard: PrayerCard,
    prayerId: string
  ) => {
    if (!email || !window.confirm("האם אתם בטוחים שברצונכם למחוק את התרומה?"))
      return;

    // Find the prayer
    const prayer = prayerId.includes("child")
      ? prayerCard.children.find(child => child.id === prayerId)
      : prayerCard.prayer;

    if (!prayer) return;

    // Remove the donation
    const updatedPrayer = prayer.removeDonation(donation.id);

    // Update the prayer card
    const updatedPrayerCard = new PrayerCard(
      prayerCard.id,
      prayerId.includes("child") ? prayerCard.prayer : updatedPrayer,
      prayerId.includes("child")
        ? prayerCard.children.map(child =>
            child.id === prayerId ? updatedPrayer : child
          )
        : prayerCard.children
    );

    await updatePrayerCard.mutateAsync(updatedPrayerCard);
  };

  const handleTogglePaid = async (
    donation: PrayerDonation,
    prayerCard: PrayerCard,
    prayerId: string
  ) => {
    if (!email) return;

    // Find the prayer
    const prayer = prayerId.includes("child")
      ? prayerCard.children.find(child => child.id === prayerId)
      : prayerCard.prayer;

    if (!prayer) return;

    // Toggle paid status
    const updatedDonation = donation.paid
      ? donation.markAsUnpaid()
      : donation.markAsPaid();
    const updatedPrayer = prayer.updateDonation(donation.id, {
      paid: updatedDonation.paid,
    });

    // Update the prayer card
    const updatedPrayerCard = new PrayerCard(
      prayerCard.id,
      prayerId.includes("child") ? prayerCard.prayer : updatedPrayer,
      prayerId.includes("child")
        ? prayerCard.children.map(child =>
            child.id === prayerId ? updatedPrayer : child
          )
        : prayerCard.children
    );

    await updatePrayerCard.mutateAsync(updatedPrayerCard);
  };

  // Check permissions and feature toggle
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  if (!synagogue?.isDonationTrackingEnabled) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          מעקב אחר תרומות וחובות אינו מופעל עבור בית כנסת זה
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        ניהול תרומות וחובות מתפללים
      </Typography>

      {/* Statistics */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="error">
                  {formatCurrency(totalUnpaid)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ חובות פתוחים
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(totalPaid)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ תרומות ששולמו
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayersWithUnpaidCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתפללים עם חובות
                </Typography>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {unpaidDonationsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  תרומות לא שולמו
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Add Donation Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>הוסף תרומה/חוב</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Autocomplete
              options={prayerOptions}
              getOptionLabel={option => option.label}
              value={
                prayerOptions.find(opt => opt.id === selectedPrayerId) || null
              }
              onChange={(_, value) => setSelectedPrayerId(value?.id || "")}
              renderInput={params => (
                <TextField {...params} label="בחר מתפלל" required />
              )}
              fullWidth
            />
          </Box>

          {/* Show form fields only after selecting a prayer */}
          {selectedPrayerId && (
            <Formik
              initialValues={{
                amount: 0,
                hebrewDate: HebrewDate.now(),
                paid: false,
                notes: "",
              }}
              validationSchema={prayerDonationValidationSchema}
              onSubmit={handleAddDonation}
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
                <Form data-prayer-donation-form>
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
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsAddDialogOpen(false);
              setSelectedPrayerId("");
            }}
          >
            ביטול
          </Button>
          {selectedPrayerId && (
            <Button
              variant="contained"
              disabled={updatePrayerCard.isPending}
              onClick={() => {
                // Trigger form submission
                const form = document.querySelector(
                  "form[data-prayer-donation-form]"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              {updatePrayerCard.isPending ? "שומר..." : "שמור"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Donation Dialog */}
      {editingDonation && (
        <PrayerDonationForm
          open={true}
          title="ערוך תרומה/חוב"
          donation={editingDonation.donation}
          onSubmit={handleEditDonation}
          onCancel={() => setEditingDonation(null)}
          isSubmitting={updatePrayerCard.isPending}
        />
      )}

      {/* Controls */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          הוסף תרומה/חוב
        </Button>

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>מיין לפי</InputLabel>
            <Select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              label="מיין לפי"
            >
              <MenuItem value="date">תאריך</MenuItem>
              <MenuItem value="amount">סכום</MenuItem>
              <MenuItem value="prayer">שם מתפלל</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
            >
              <MenuItem value="desc">ירידה</MenuItem>
              <MenuItem value="asc">עלייה</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label={`הכל (${allDonationsWithContext.length})`} />
          <Tab
            label={`לא שולם (${allDonationsWithContext.filter(item => !item.donation.paid).length})`}
          />
          <Tab
            label={`שולם (${allDonationsWithContext.filter(item => item.donation.paid).length})`}
          />
        </Tabs>
      </Box>

      {/* Donations List */}
      {donationsByPrayer.size === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PersonIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין תרומות רשומות
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 1 && "אין חובות פתוחים"}
              {activeTab === 2 && "אין תרומות ששולמו"}
              {activeTab === 0 && "לחץ על 'הוסף תרומה/חוב' כדי להתחיל"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {Array.from(donationsByPrayer.entries()).map(
            ([prayerId, donations]) => {
              const firstDonation = donations[0];
              const prayer = firstDonation.prayer;
              const prayerCard = firstDonation.prayerCard;
              const totalUnpaidForPrayer = prayer.unpaidDonations.reduce(
                (sum, d) => sum + d.amount,
                0
              );

              return (
                <Card key={prayerId} elevation={2}>
                  <CardContent>
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ flex: 1 }}>
                        {prayer.fullName}
                      </Typography>
                      {totalUnpaidForPrayer > 0 && (
                        <Chip
                          label={`חוב: ${formatCurrency(totalUnpaidForPrayer)}`}
                          color="error"
                          size="small"
                        />
                      )}
                      <Button
                        size="small"
                        onClick={() => navigate(`prayer-card`)}
                        startIcon={<PersonIcon />}
                      >
                        כרטיס מתפלל
                      </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                      {donations.map((item, index) => (
                        <Box
                          key={item.donation.id}
                          sx={{
                            p: 2,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6" color="primary">
                                {formatCurrency(item.donation.amount)}
                              </Typography>
                              <Chip
                                label={item.donation.paid ? "שולם" : "לא שולם"}
                                color={item.donation.paid ? "success" : "error"}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.donation.hebrewDate.toString()}
                            </Typography>
                            {item.donation.notes && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {item.donation.notes}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip
                              title={
                                item.donation.paid
                                  ? "סמן כלא שולם"
                                  : "סמן כשולם"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleTogglePaid(
                                    item.donation,
                                    prayerCard,
                                    prayerId
                                  )
                                }
                                color={item.donation.paid ? "error" : "success"}
                              >
                                {item.donation.paid ? (
                                  <CloseIcon />
                                ) : (
                                  <CheckIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ערוך">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setEditingDonation({
                                    donation: item.donation,
                                    prayerCard,
                                    prayerId,
                                  })
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="מחק">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteDonation(
                                    item.donation,
                                    prayerCard,
                                    prayerId
                                  )
                                }
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              );
            }
          )}
        </Stack>
      )}
    </Box>
  );
};

const AdminPrayerDonationsPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminPrayerDonationsContent />
    </WithLogin>
  );
};

export default AdminPrayerDonationsPage;

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ChildCare as ChildCareIcon,
  Event as EventIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useCreatePrayerCard } from "../hooks/usePrayerCard";
import { useDeletePrayerCard } from "../hooks/usePrayerCard";
import { PrayerCard, Prayer } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerCardEditDialog } from "../components/PrayerCardEditDialog";

// Helper function to calculate age from Hebrew birthdate
const calculateAgeFromHebrewDate = (hebrewBirthDate: HebrewDate): number => {
  const today = new Date();
  const birthDate = hebrewBirthDate.toGregorianDate();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Helper function to check if prayer is eligible for aliya (13+ or no birthdate)
const isEligibleForAliya = (prayer: Prayer): boolean => {
  // If no birthdate, include them
  if (!prayer.hebrewBirthDate) {
    return true;
  }

  // Check if 13 years or older
  const age = calculateAgeFromHebrewDate(prayer.hebrewBirthDate);
  return age >= 13;
};

const AdminPrayerCardsPage: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();

  const createPrayerMutation = useCreatePrayerCard();
  const deletePrayerMutation = useDeletePrayerCard();

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // State for editing
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingPrayerCard, setEditingPrayerCard] = useState<PrayerCard | null>(
    null
  );

  // Calculate number of prayers above age 13
  const prayersAbove13Count = useMemo(() => {
    if (!prayerCards) return 0;

    let count = 0;

    prayerCards.forEach(card => {
      // Add the main prayer (adult) if eligible
      if (isEligibleForAliya(card.prayer)) {
        count++;
      }

      // Add children if eligible (13+ or no birthdate)
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          count++;
        }
      });
    });

    return count;
  }, [prayerCards]);

  // Filter prayer cards based on search term
  const filteredPrayerCards = useMemo(() => {
    if (!prayerCards || !searchTerm.trim()) {
      return prayerCards || [];
    }

    const searchLower = searchTerm.toLowerCase();
    return prayerCards.filter((prayerCard: PrayerCard) => {
      // Check main prayer
      const mainPrayerMatch =
        prayerCard.prayer.firstName.toLowerCase().includes(searchLower) ||
        prayerCard.prayer.lastName.toLowerCase().includes(searchLower);

      // Check children
      const childrenMatch = prayerCard.children.some(
        (child: any) =>
          child.firstName.toLowerCase().includes(searchLower) ||
          child.lastName.toLowerCase().includes(searchLower)
      );

      return mainPrayerMatch || childrenMatch;
    });
  }, [prayerCards, searchTerm]);

  const handleEditPrayerCard = (prayerCard: PrayerCard) => {
    setEditingPrayerCard(prayerCard);
    setShowEditDialog(true);
  };

  const handleSavePrayerCard = async (updatedPrayerCard: PrayerCard) => {
    await createPrayerMutation.mutateAsync(updatedPrayerCard);
  };

  const handleDeletePrayerCard = async (prayerCard: PrayerCard) => {
    const prayerName = `${prayerCard.prayer.firstName} ${prayerCard.prayer.lastName}`;

    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את כרטיס המתפלל של ${prayerName}?`
      )
    ) {
      try {
        await deletePrayerMutation.mutateAsync(prayerCard);
      } catch (error) {
        console.error("Error deleting prayer card:", error);
      }
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען כרטיסי מתפללים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        ניהול כרטיסי מתפללים
      </Typography>

      {/* Statistics Row */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayerCards?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כרטיסי מתפלל
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayersAbove13Count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתפללים מעל גיל 13
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="חיפוש לפי שם פרטי או שם משפחה..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        נמצאו {filteredPrayerCards.length} כרטיסי מתפללים
      </Typography>

      {/* Prayer Cards List */}
      <Stack spacing={2}>
        {filteredPrayerCards.map((prayerCard: PrayerCard) => {
          // Get all aliyot from main prayer and children
          const allAliyot = [
            ...prayerCard.prayer.aliyot.map((aliya: any) => ({
              aliya,
              person: prayerCard.prayer,
              isChild: false,
            })),
            ...prayerCard.children.flatMap((child: any) =>
              child.aliyot.map((aliya: any) => ({
                aliya,
                person: child,
                isChild: true,
              }))
            ),
          ];

          return (
            <Card key={prayerCard.id} variant="outlined">
              <CardContent>
                {/* Header with name and actions */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {prayerCard.prayer.firstName} {prayerCard.prayer.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prayerCard.prayer.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={() => handleEditPrayerCard(prayerCard)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeletePrayerCard(prayerCard)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Quick info */}
                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<ChildCareIcon />}
                    label={`${prayerCard.children.length} ילדים`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<EventIcon />}
                    label={`${prayerCard.prayer.events.length} אירועים`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<GroupIcon />}
                    label={`${allAliyot.length} עליות`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Children preview */}
                {prayerCard.children.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      ילדים:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {prayerCard.children.map((child: any, index: number) => (
                        <Chip
                          key={index}
                          label={`${child.firstName} ${child.lastName}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Phone number */}
                {prayerCard.prayer.phoneNumber && (
                  <Typography variant="body2" color="text.secondary">
                    טלפון: {prayerCard.prayer.phoneNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {filteredPrayerCards.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {searchTerm
            ? "לא נמצאו כרטיסי מתפללים המתאימים לחיפוש"
            : "אין כרטיסי מתפללים"}
        </Alert>
      )}

      {/* Edit Prayer Card Dialog */}
      <PrayerCardEditDialog
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditingPrayerCard(null);
        }}
        prayerCard={editingPrayerCard}
        onSave={handleSavePrayerCard}
        isLoading={createPrayerMutation.isPending}
      />
    </Box>
  );
};

export default AdminPrayerCardsPage;

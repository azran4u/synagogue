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
import { PrayerCard } from "../model/Prayer";
import { PrayerCardEditDialog } from "../components/PrayerCardEditDialog";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { getAliyotForPrayer } from "../utils/aliyaAssignments";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { isEligibleForAliya } from "../utils/prayerUtils";

const AdminPrayerCardsPage: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: aliyaGroups } = useAliyaGroups();
  const navigate = useSynagogueNavigate();

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

      // Add children if eligible (active, parent active, 13+ or no birthdate)
      card.children.forEach(child => {
        if (isEligibleForAliya(child, card.prayer)) {
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
      const nameMatchTerm = (
        firstName: string,
        lastName: string,
        term: string
      ) => {
        const termLower = term.toLowerCase().trim();
        const firstNameLower = firstName.toLowerCase();
        const lastNameLower = lastName.toLowerCase();
        return (
          firstNameLower.includes(termLower) ||
          lastNameLower.includes(termLower) ||
          (firstNameLower + " " + lastNameLower).includes(termLower) ||
          (lastNameLower + " " + firstNameLower).includes(termLower)
        );
      };
      const mainPrayerMatch = nameMatchTerm(
        prayerCard.prayer.firstName,
        prayerCard.prayer.lastName,
        searchLower
      );
      const childrenMatch = prayerCard.children.some((child: any) =>
        nameMatchTerm(child.firstName, child.lastName, searchLower)
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
          // Count only this prayer's aliyot (matches aliya-history?prayerId=...)
          const aliyotCount = aliyaGroups
            ? getAliyotForPrayer(prayerCard.prayer.id, aliyaGroups).length
            : 0;

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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="h6">
                        {prayerCard.prayer.firstName}{" "}
                        {prayerCard.prayer.lastName}
                      </Typography>
                      {prayerCard.prayer.isActive === false && (
                        <Chip
                          label="לא פעיל"
                          size="small"
                          color="default"
                          variant="filled"
                        />
                      )}
                    </Box>
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
                    label={`${aliyotCount} עליות`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() =>
                      navigate(
                        `admin/aliya-history?prayerId=${prayerCard.prayer.id}`
                      )
                    }
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
                      {prayerCard.children.map((child, index) => {
                        const childInactive =
                          child.isActive === false ||
                          prayerCard.prayer.isActive === false;
                        return (
                          <Chip
                            key={child.id || index}
                            label={
                              childInactive
                                ? `${child.firstName} ${child.lastName} (לא פעיל)`
                                : `${child.firstName} ${child.lastName}`
                            }
                            size="small"
                            variant="outlined"
                            color={childInactive ? "default" : "secondary"}
                          />
                        );
                      })}
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

import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { AliyaEvent } from "../model/AliyaEvent";
import { Prayer } from "../model/Prayer";
import { PrayerCard } from "../model/Prayer";
import { AliyaGroup } from "../model/AliyaGroup";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import {
  useCreateAliyaGroup,
  useUpdateAliyaGroup,
  useDeleteAliyaGroup,
} from "../hooks/useAliyaGroups";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { HebrewDateSelector } from "../components/HebrewDateSelector";
import { HebrewDate } from "../model/HebrewDate";
import { useUpdatePrayerCard } from "../hooks/usePrayerCard";

interface AliyaAssignmentFormValues {
  aliyaGroupId: string;
  assignments: Record<string, string>; // aliyaTypeId -> assignedPrayerId
  deletions: string[]; // aliyaTypeIds to delete from database
}

interface AliyaReassignmentFormValues {
  assignedPrayerId: string;
}

interface AliyaGroupFormValues {
  label: string;
  hebrewDate: HebrewDate | null;
}

interface EditGroupFormValues {
  assignments: Record<string, string>; // aliyaTypeId -> assignedPrayerId
  deletions: string[]; // aliyaTypeIds to delete from database
}

const aliyaAssignmentValidationSchema = Yup.object({
  aliyaGroupId: Yup.string().required("קבוצת עליות נדרשת"),
  assignments: Yup.object(),
  deletions: Yup.array(),
});

const reassignmentValidationSchema = Yup.object({
  assignedPrayerId: Yup.string().required("מתפלל נדרש"),
});

const aliyaGroupValidationSchema = Yup.object({
  label: Yup.string().required("תווית קבוצה נדרשת"),
  hebrewDate: Yup.object().required("תאריך עברי נדרש"),
});

const editGroupValidationSchema = Yup.object({
  assignments: Yup.object(),
  deletions: Yup.array(),
});

// Helper function to check if prayer is eligible for aliya (13+ or no birthdate)
const isEligibleForAliya = (prayer: Prayer): boolean => {
  // If no birthdate, include them
  if (!prayer.hebrewBirthDate) {
    return true;
  }

  // Check if 13 years or older
  return prayer.hebrewBirthDate.isOlderThan(13);
};

const AdminAliyaAssignmentContent = () => {
  const navigate = useSynagogueNavigate();
  const { isGabaiOrHigher } = useUser();

  // State for dialogs
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDetailsDialog, setShowEditGroupDetailsDialog] =
    useState(false);
  const [editingAliya, setEditingAliya] = useState<{
    aliya: AliyaEvent;
    prayer: Prayer;
    prayerCard: PrayerCard;
  } | null>(null);
  const [editingGroup, setEditingGroup] = useState<AliyaGroup | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showPrayerSelectionDialog, setShowPrayerSelectionDialog] =
    useState(false);
  const [selectedAliyaTypeForAssignment, setSelectedAliyaTypeForAssignment] =
    useState<string | null>(null);
  const [currentAssignmentGroupId, setCurrentAssignmentGroupId] = useState<
    string | null
  >(null);
  const assignmentFormikRef = React.useRef<any>(null);
  const editGroupFormikRef = React.useRef<any>(null);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Data fetching
  const { data: aliyaTypes, isLoading: aliyaTypesLoading } = useAliyaTypes();
  const { data: aliyaGroups, isLoading: aliyaGroupsLoading } = useAliyaGroups();
  const { data: prayerCards, isLoading: prayerCardsLoading } =
    useAllPrayerCards();
  const updatePrayerCardMutation = useUpdatePrayerCard();
  const createAliyaGroupMutation = useCreateAliyaGroup();
  const updateAliyaGroupMutation = useUpdateAliyaGroup();
  const deleteAliyaGroupMutation = useDeleteAliyaGroup();

  // Initial form values
  const initialAssignmentFormValues: AliyaAssignmentFormValues = {
    aliyaGroupId: "",
    assignments: {},
    deletions: [],
  };

  const initialReassignmentFormValues: AliyaReassignmentFormValues = {
    assignedPrayerId: "",
  };

  const initialAliyaGroupFormValues: AliyaGroupFormValues = {
    label: "",
    hebrewDate: null,
  };

  const initialEditGroupFormValues: EditGroupFormValues = {
    assignments: {},
    deletions: [],
  };

  // Get all prayers (adults and children) from all prayer cards
  // Filter to only show those 13+ years old or with no birthdate
  const allPrayers = React.useMemo(() => {
    if (!prayerCards) return [];

    const prayers: Array<{
      prayer: Prayer;
      isChild: boolean;
      parentName?: string;
    }> = [];

    prayerCards.forEach(card => {
      // Add the main prayer (adult) if eligible
      if (isEligibleForAliya(card.prayer)) {
        prayers.push({
          prayer: card.prayer,
          isChild: false,
        });
      }

      // Add children if eligible (13+ or no birthdate)
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          prayers.push({
            prayer: child,
            isChild: true,
            parentName: `${card.prayer.firstName} ${card.prayer.lastName}`,
          });
        }
      });
    });

    return prayers;
  }, [prayerCards]);

  // Get all aliyot from all prayers with prayer card info
  const allAliyot = React.useMemo(() => {
    if (!prayerCards) return [];

    const aliyot: Array<{
      aliya: AliyaEvent;
      prayer: Prayer;
      prayerCard: PrayerCard;
      isChild: boolean;
      parentName?: string;
    }> = [];

    prayerCards.forEach(card => {
      // Add aliyot from main prayer
      card.prayer.aliyot.forEach(aliya => {
        aliyot.push({
          aliya,
          prayer: card.prayer,
          prayerCard: card,
          isChild: false,
        });
      });

      // Add aliyot from children
      card.children.forEach(child => {
        child.aliyot.forEach(aliya => {
          aliyot.push({
            aliya,
            prayer: child,
            prayerCard: card,
            isChild: true,
            parentName: `${card.prayer.firstName} ${card.prayer.lastName}`,
          });
        });
      });
    });

    return aliyot.sort((a, b) => {
      // Sort by aliya type display order
      const aliyaTypeA = aliyaTypes?.find(
        type => type.id === a.aliya.aliyaType
      );
      const aliyaTypeB = aliyaTypes?.find(
        type => type.id === b.aliya.aliyaType
      );

      const orderA = aliyaTypeA?.displayOrder ?? 0;
      const orderB = aliyaTypeB?.displayOrder ?? 0;

      return orderA - orderB;
    });
  }, [prayerCards, aliyaTypes]);

  // Get groups with aliyot counts
  const groupsWithCounts = React.useMemo(() => {
    if (!aliyaGroups) return [];

    return aliyaGroups
      .map(group => {
        const count = allAliyot.filter(
          aliyaData => aliyaData.aliya.aliyaGroupId === group.id
        ).length;

        return {
          group,
          count,
        };
      })
      .sort((a, b) => {
        // Sort by Hebrew date (newest first)
        const dateA = a.group.hebrewDate.toGregorianDate().getTime();
        const dateB = b.group.hebrewDate.toGregorianDate().getTime();
        return dateB - dateA; // Descending order (newest first)
      });
  }, [aliyaGroups, allAliyot]);

  // Handlers
  const handleAliyaAssignment = async (
    values: AliyaAssignmentFormValues,
    { setSubmitting }: FormikHelpers<AliyaAssignmentFormValues>
  ) => {
    try {
      // Collect all aliya types we're working with (assignments + deletions)
      const allAliyaTypesToProcess = new Set([
        ...Object.keys(values.assignments),
        ...values.deletions,
      ]);

      // First, remove ALL existing assignments for these (groupId, typeId) combinations from ALL prayers
      for (const aliyaTypeId of allAliyaTypesToProcess) {
        // Find all prayer cards that have this aliya assignment
        const affectedPrayerCards = prayerCards?.filter(card => {
          // Check if main prayer has this aliya
          const mainHasAliya = card.prayer.aliyot.some(
            aliya =>
              aliya.aliyaGroupId === values.aliyaGroupId &&
              aliya.aliyaType === aliyaTypeId
          );

          // Check if any child has this aliya
          const childHasAliya = card.children.some(child =>
            child.aliyot.some(
              aliya =>
                aliya.aliyaGroupId === values.aliyaGroupId &&
                aliya.aliyaType === aliyaTypeId
            )
          );

          return mainHasAliya || childHasAliya;
        });

        // Remove the aliya from all affected prayer cards
        if (affectedPrayerCards) {
          for (const prayerCard of affectedPrayerCards) {
            // Remove from main prayer
            const updatedMainPrayer = prayerCard.prayer.update({
              aliyot: prayerCard.prayer.aliyot.filter(
                aliya =>
                  !(
                    aliya.aliyaGroupId === values.aliyaGroupId &&
                    aliya.aliyaType === aliyaTypeId
                  )
              ),
            });

            // Remove from children
            const updatedChildren = prayerCard.children.map(child =>
              child.update({
                aliyot: child.aliyot.filter(
                  aliya =>
                    !(
                      aliya.aliyaGroupId === values.aliyaGroupId &&
                      aliya.aliyaType === aliyaTypeId
                    )
                ),
              })
            );

            const updatedPrayerCard = new PrayerCard(
              prayerCard.id,
              updatedMainPrayer,
              updatedChildren
            );

            await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
          }
        }
      }

      // Then, add new assignments (skip deletions)
      for (const [aliyaTypeId, assignedPrayerId] of Object.entries(
        values.assignments
      )) {
        // Find the prayer card containing the target prayer
        const targetPrayerCard = prayerCards?.find(
          card =>
            card.prayer.id === assignedPrayerId ||
            card.children.some(child => child.id === assignedPrayerId)
        );

        if (!targetPrayerCard) {
          throw new Error(
            `Prayer card not found for prayer ${assignedPrayerId}`
          );
        }

        // Create new aliya event
        const newAliya = AliyaEvent.create(values.aliyaGroupId, aliyaTypeId);

        // Update the prayer card
        let updatedPrayerCard = targetPrayerCard;

        if (targetPrayerCard.prayer.id === assignedPrayerId) {
          // Assign to main prayer
          const updatedPrayer = targetPrayerCard.prayer.update({
            aliyot: [...targetPrayerCard.prayer.aliyot, newAliya],
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            updatedPrayer,
            targetPrayerCard.children
          );
        } else {
          // Assign to child
          const updatedChildren = targetPrayerCard.children.map(child => {
            if (child.id === assignedPrayerId) {
              return child.update({
                aliyot: [...child.aliyot, newAliya],
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            targetPrayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
      }

      // Invalidate prayer cards cache to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });

      setShowAssignmentDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya assignment:", error);
      setSubmitting(false);
    }
  };

  const handleReassignAliya = async (
    values: AliyaReassignmentFormValues,
    { setSubmitting }: FormikHelpers<AliyaReassignmentFormValues>
  ) => {
    if (!editingAliya) return;

    try {
      // Find the target prayer card
      const targetPrayerCard = prayerCards?.find(
        card =>
          card.prayer.id === values.assignedPrayerId ||
          card.children.some(child => child.id === values.assignedPrayerId)
      );

      if (!targetPrayerCard) {
        throw new Error(
          `Prayer card not found for prayer ${values.assignedPrayerId}`
        );
      }

      // Remove aliya from current prayer
      let updatedCurrentPrayerCard = editingAliya.prayerCard;
      if (editingAliya.prayerCard.prayer.id === editingAliya.prayer.id) {
        // Remove from main prayer
        const updatedPrayer = editingAliya.prayer.update({
          aliyot: editingAliya.prayer.aliyot.filter(
            a => a !== editingAliya.aliya
          ),
        });
        updatedCurrentPrayerCard = new PrayerCard(
          editingAliya.prayerCard.id,
          updatedPrayer,
          editingAliya.prayerCard.children
        );
      } else {
        // Remove from child
        const updatedChildren = editingAliya.prayerCard.children.map(child => {
          if (child.id === editingAliya.prayer.id) {
            return child.update({
              aliyot: child.aliyot.filter(a => a !== editingAliya.aliya),
            });
          }
          return child;
        });
        updatedCurrentPrayerCard = new PrayerCard(
          editingAliya.prayerCard.id,
          editingAliya.prayerCard.prayer,
          updatedChildren
        );
      }

      // Add aliya to new prayer
      let updatedTargetPrayerCard = targetPrayerCard;
      if (targetPrayerCard.prayer.id === values.assignedPrayerId) {
        // Add to main prayer
        const updatedPrayer = targetPrayerCard.prayer.update({
          aliyot: [...targetPrayerCard.prayer.aliyot, editingAliya.aliya],
        });
        updatedTargetPrayerCard = new PrayerCard(
          targetPrayerCard.id,
          updatedPrayer,
          targetPrayerCard.children
        );
      } else {
        // Add to child
        const updatedChildren = targetPrayerCard.children.map(child => {
          if (child.id === values.assignedPrayerId) {
            return child.update({
              aliyot: [...child.aliyot, editingAliya.aliya],
            });
          }
          return child;
        });
        updatedTargetPrayerCard = new PrayerCard(
          targetPrayerCard.id,
          targetPrayerCard.prayer,
          updatedChildren
        );
      }

      // Update both prayer cards in database
      await updatePrayerCardMutation.mutateAsync(updatedCurrentPrayerCard);
      if (updatedCurrentPrayerCard.id !== updatedTargetPrayerCard.id) {
        await updatePrayerCardMutation.mutateAsync(updatedTargetPrayerCard);
      }

      // Invalidate prayer cards cache to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });

      setShowReassignDialog(false);
      setEditingAliya(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error reassigning aliya:", error);
      setSubmitting(false);
    }
  };

  const handleDeleteAliya = async (aliyaData: (typeof allAliyot)[0]) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את העלייה?")) {
      try {
        // Remove aliya from prayer
        let updatedPrayerCard = aliyaData.prayerCard;

        if (aliyaData.prayerCard.prayer.id === aliyaData.prayer.id) {
          // Remove from main prayer
          const updatedPrayer = aliyaData.prayer.update({
            aliyot: aliyaData.prayer.aliyot.filter(a => a !== aliyaData.aliya),
          });
          updatedPrayerCard = new PrayerCard(
            aliyaData.prayerCard.id,
            updatedPrayer,
            aliyaData.prayerCard.children
          );
        } else {
          // Remove from child
          const updatedChildren = aliyaData.prayerCard.children.map(child => {
            if (child.id === aliyaData.prayer.id) {
              return child.update({
                aliyot: child.aliyot.filter(a => a !== aliyaData.aliya),
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            aliyaData.prayerCard.id,
            aliyaData.prayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);

        // Invalidate prayer cards cache to refresh the UI
        await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });
      } catch (error) {
        console.error("Error deleting aliya:", error);
      }
    }
  };

  const handleReassignClick = (aliyaData: (typeof allAliyot)[0]) => {
    setEditingAliya(aliyaData);
    setShowReassignDialog(true);
  };

  const handleEditGroup = (group: AliyaGroup) => {
    setEditingGroup(group);
    setShowEditGroupDialog(true);
  };

  const handleToggleGroupExpansion = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleCreateAliyaGroup = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    try {
      const newGroup = AliyaGroup.create(values.label, values.hebrewDate!);
      await createAliyaGroupMutation.mutateAsync(newGroup);
      setShowCreateGroupDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya group:", error);
      setSubmitting(false);
    }
  };

  const handleUpdateAliyaGroup = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    if (!editingGroup) return;

    try {
      const updatedGroup = editingGroup.update({
        label: values.label,
        hebrewDate: values.hebrewDate!,
      });
      await updateAliyaGroupMutation.mutateAsync(updatedGroup);
      setShowEditGroupDetailsDialog(false);
      setEditingGroup(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating aliya group:", error);
      setSubmitting(false);
    }
  };

  const handleDeleteAliyaGroup = async (group: AliyaGroup) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את הקבוצה "${group.label}"? כל העליות הקשורות לקבוצה זו יימחקו מכל כרטיסי המתפללים.`
      )
    ) {
      try {
        // First, remove all aliya events with this group ID from all prayer cards
        if (prayerCards) {
          for (const prayerCard of prayerCards) {
            let updatedPrayer = prayerCard.prayer;
            let updatedChildren = prayerCard.children;

            // Remove aliyot from main prayer
            const filteredMainAliyot = prayerCard.prayer.aliyot.filter(
              aliya => aliya.aliyaGroupId !== group.id
            );
            if (filteredMainAliyot.length !== prayerCard.prayer.aliyot.length) {
              updatedPrayer = prayerCard.prayer.update({
                aliyot: filteredMainAliyot,
              });
            }

            // Remove aliyot from children
            updatedChildren = prayerCard.children.map(child => {
              const filteredChildAliyot = child.aliyot.filter(
                aliya => aliya.aliyaGroupId !== group.id
              );
              if (filteredChildAliyot.length !== child.aliyot.length) {
                return child.update({
                  aliyot: filteredChildAliyot,
                });
              }
              return child;
            });

            // Update prayer card if any aliyot were removed
            if (
              updatedPrayer !== prayerCard.prayer ||
              updatedChildren.some(
                (child, index) => child !== prayerCard.children[index]
              )
            ) {
              const updatedPrayerCard = new PrayerCard(
                prayerCard.id,
                updatedPrayer,
                updatedChildren
              );
              await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
            }
          }
        }

        // Then delete the aliya group
        await deleteAliyaGroupMutation.mutateAsync(group.id);

        // Invalidate prayer cards cache to refresh the UI
        await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });
      } catch (error) {
        console.error("Error deleting aliya group:", error);
      }
    }
  };

  const handleEditGroupDetails = (group: AliyaGroup) => {
    setEditingGroup(group);
    setShowEditGroupDetailsDialog(true);
  };

  const handleEditGroupSubmit = async (
    values: EditGroupFormValues,
    { setSubmitting }: FormikHelpers<EditGroupFormValues>
  ) => {
    try {
      if (!editingGroup) return;

      // Collect all aliya types we're working with (assignments + deletions)
      const allAliyaTypesToProcess = new Set([
        ...Object.keys(values.assignments),
        ...values.deletions,
      ]);

      // First, remove ALL existing assignments for these (groupId, typeId) combinations from ALL prayers
      for (const aliyaTypeId of allAliyaTypesToProcess) {
        // Find all prayer cards that have this aliya assignment
        const affectedPrayerCards = prayerCards?.filter(card => {
          // Check if main prayer has this aliya
          const mainHasAliya = card.prayer.aliyot.some(
            aliya =>
              aliya.aliyaGroupId === editingGroup.id &&
              aliya.aliyaType === aliyaTypeId
          );

          // Check if any child has this aliya
          const childHasAliya = card.children.some(child =>
            child.aliyot.some(
              aliya =>
                aliya.aliyaGroupId === editingGroup.id &&
                aliya.aliyaType === aliyaTypeId
            )
          );

          return mainHasAliya || childHasAliya;
        });

        // Remove the aliya from all affected prayer cards
        if (affectedPrayerCards) {
          for (const prayerCard of affectedPrayerCards) {
            // Remove from main prayer
            const updatedMainPrayer = prayerCard.prayer.update({
              aliyot: prayerCard.prayer.aliyot.filter(
                aliya =>
                  !(
                    aliya.aliyaGroupId === editingGroup.id &&
                    aliya.aliyaType === aliyaTypeId
                  )
              ),
            });

            // Remove from children
            const updatedChildren = prayerCard.children.map(child =>
              child.update({
                aliyot: child.aliyot.filter(
                  aliya =>
                    !(
                      aliya.aliyaGroupId === editingGroup.id &&
                      aliya.aliyaType === aliyaTypeId
                    )
                ),
              })
            );

            const updatedPrayerCard = new PrayerCard(
              prayerCard.id,
              updatedMainPrayer,
              updatedChildren
            );

            await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
          }
        }
      }

      // Then, add new assignments (skip deletions)
      for (const [aliyaTypeId, assignedPrayerId] of Object.entries(
        values.assignments
      )) {
        // Find the prayer card containing the target prayer
        const targetPrayerCard = prayerCards?.find(
          card =>
            card.prayer.id === assignedPrayerId ||
            card.children.some(child => child.id === assignedPrayerId)
        );

        if (!targetPrayerCard) {
          throw new Error(
            `Prayer card not found for prayer ${assignedPrayerId}`
          );
        }

        // Create new aliya event
        const newAliya = AliyaEvent.create(editingGroup.id, aliyaTypeId);

        // Update the prayer card
        let updatedPrayerCard = targetPrayerCard;

        if (targetPrayerCard.prayer.id === assignedPrayerId) {
          // Assign to main prayer
          const updatedPrayer = targetPrayerCard.prayer.update({
            aliyot: [...targetPrayerCard.prayer.aliyot, newAliya],
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            updatedPrayer,
            targetPrayerCard.children
          );
        } else {
          // Assign to child
          const updatedChildren = targetPrayerCard.children.map(child => {
            if (child.id === assignedPrayerId) {
              return child.update({
                aliyot: [...child.aliyot, newAliya],
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            targetPrayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
      }

      // Invalidate prayer cards cache to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });

      setShowEditGroupDialog(false);
      setEditingGroup(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error adding aliyot to group:", error);
      setSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate("");
  };

  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          אין לך הרשאות גישה לדף זה. רק מנהלים יכולים לגשת לניהול עליות.
        </Alert>
      </Box>
    );
  }

  if (aliyaTypesLoading || aliyaGroupsLoading || prayerCardsLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
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
          ניהול עליות
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
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleBackToHome}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            חזור לדף הבית
          </Button>
        </Box>
      </Box>

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
                  {allAliyot.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  עליות מוקצות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {aliyaGroups?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  קבוצות עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {aliyaTypes?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סוגי עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {allPrayers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתפללים מעל גיל 13
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayerCards?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כרטיסי מתפלל
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Groups List */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowCreateGroupDialog(true)}
                variant="contained"
                color="primary"
              >
                הוסף קבוצה
              </Button>
            </Box>
          </Box>

          {!groupsWithCounts || groupsWithCounts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <AssignmentIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                אין קבוצות עליות
              </Typography>
              <Typography variant="body2" color="text.secondary">
                לחץ על "הוסף קבוצה" כדי ליצור קבוצה ראשונה
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {groupsWithCounts.map(({ group, count }) => {
                const isExpanded = expandedGroupId === group.id;
                const groupAliyot = allAliyot.filter(
                  aliyaData => aliyaData.aliya.aliyaGroupId === group.id
                );

                return (
                  <Card key={group.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "flex-start" },
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                              borderRadius: 1,
                            },
                            p: 1,
                            m: -1,
                          }}
                          onClick={() => handleToggleGroupExpansion(group.id)}
                        >
                          {/* First row: Group label and count */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={group.label}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={`${count} עליות`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                          {/* Second row: Date with action icons */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarIcon />
                              <Typography variant="body2">
                                {group.hebrewDate.toString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={() => handleEditGroupDetails(group)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteAliyaGroup(group)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Add aliyot button */}
                        <Box
                          sx={{
                            flexShrink: 0,
                            display: { xs: "block", sm: "block" },
                          }}
                        >
                          <Button
                            onClick={() => handleEditGroup(group)}
                            startIcon={<AssignmentIcon />}
                            variant="outlined"
                            size="small"
                            color="secondary"
                            fullWidth
                          >
                            {count > 0 ? "ערוך עליות" : "הוסף עליות"}
                          </Button>
                        </Box>
                      </Box>

                      {/* Expanded view showing all aliyot in the group */}
                      {isExpanded && (
                        <Box
                          sx={{
                            mt: 2,
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            עליות בקבוצה ({groupAliyot.length})
                          </Typography>
                          {groupAliyot.length > 0 ? (
                            <Stack spacing={1}>
                              {groupAliyot.map(
                                (
                                  { aliya, prayer, prayerCard, isChild },
                                  index
                                ) => {
                                  const aliyaType = aliyaTypes?.find(
                                    type => type.id === aliya.aliyaType
                                  );
                                  return (
                                    <Box
                                      key={`${prayer.id}-${aliya.aliyaGroupId}-${aliya.aliyaType}`}
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        p: 1.5,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        backgroundColor: "background.paper",
                                      }}
                                    >
                                      {/* Prayer info row */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 500 }}
                                        >
                                          {prayer.firstName} {prayer.lastName}
                                        </Typography>
                                        {isChild && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontWeight: 400 }}
                                          >
                                            בן/בת {prayerCard.prayer.firstName}{" "}
                                            {prayerCard.prayer.lastName}
                                          </Typography>
                                        )}
                                        {isChild && (
                                          <Chip
                                            label="ילד"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>

                                      {/* Action buttons and aliya type row */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 2,
                                        }}
                                      >
                                        {/* Action buttons on the left */}
                                        <Chip
                                          label={
                                            aliyaType?.displayName ||
                                            aliya.aliyaType
                                          }
                                          size="small"
                                          color={
                                            aliyaType?.isHighPriority
                                              ? "error"
                                              : aliyaType?.isMediumPriority
                                                ? "warning"
                                                : "secondary"
                                          }
                                        />
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleReassignClick({
                                                aliya,
                                                prayer,
                                                prayerCard,
                                                isChild,
                                              })
                                            }
                                            color="primary"
                                          >
                                            <EditIcon />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleDeleteAliya({
                                                aliya,
                                                prayer,
                                                prayerCard,
                                                isChild,
                                              })
                                            }
                                            color="error"
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Box>

                                        {/* Aliya type on the right */}
                                      </Box>
                                    </Box>
                                  );
                                }
                              )}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              אין עליות בקבוצה זו
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Aliya Assignment Dialog */}
      <Dialog
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>הקצה עליות לקבוצה</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialAssignmentFormValues}
            validationSchema={aliyaAssignmentValidationSchema}
            onSubmit={handleAliyaAssignment}
            innerRef={assignmentFormikRef}
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
                  <FormControl
                    fullWidth
                    error={touched.aliyaGroupId && Boolean(errors.aliyaGroupId)}
                  >
                    <InputLabel>קבוצת עליות</InputLabel>
                    <Select
                      name="aliyaGroupId"
                      value={values.aliyaGroupId}
                      onChange={e => {
                        handleChange(e);
                        setCurrentAssignmentGroupId(e.target.value);
                      }}
                      onBlur={handleBlur}
                      label="קבוצת עליות"
                    >
                      {aliyaGroups?.map(group => (
                        <MenuItem key={group.id} value={group.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography>{group.label}</Typography>
                            <Chip
                              label={group.hebrewDate.toString()}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {values.aliyaGroupId && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        סוגי עליות
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        לחץ על הכפתור ליד כל עלייה כדי להקצות מתפלל
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        {aliyaTypes
                          ?.sort(
                            (a, b) =>
                              (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .filter(type => {
                            // Show enabled types
                            if (type.enabled) return true;

                            // For disabled types, only show if they have an existing assignment in this group
                            if (values.aliyaGroupId) {
                              const hasExistingAssignment = allAliyot.some(
                                aliyaData =>
                                  aliyaData.aliya.aliyaGroupId ===
                                    values.aliyaGroupId &&
                                  aliyaData.aliya.aliyaType === type.id
                              );
                              return hasExistingAssignment;
                            }

                            return false;
                          })
                          .map(type => {
                            // Check if this aliya type is marked for deletion
                            const isMarkedForDeletion =
                              values.deletions.includes(type.id);

                            // First check if there's a new assignment in the form
                            let assignedPrayerId = values.assignments[type.id];

                            // If not and not marked for deletion, check if there's an existing assignment in the database
                            if (
                              !assignedPrayerId &&
                              !isMarkedForDeletion &&
                              values.aliyaGroupId
                            ) {
                              const existingAliya = allAliyot.find(
                                aliyaData =>
                                  aliyaData.aliya.aliyaGroupId ===
                                    values.aliyaGroupId &&
                                  aliyaData.aliya.aliyaType === type.id
                              );
                              if (existingAliya) {
                                assignedPrayerId = existingAliya.prayer.id;
                              }
                            }

                            const assignedPrayer = assignedPrayerId
                              ? allPrayers.find(
                                  p => p.prayer.id === assignedPrayerId
                                )
                              : null;

                            return (
                              <Card key={type.id} variant="outlined">
                                <CardContent sx={{ py: 1, px: 2 }}>
                                  {/* First row: Aliya type name and buttons */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography variant="h6">
                                      {type.displayName}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Tooltip
                                        title={
                                          !type.enabled && !assignedPrayer
                                            ? "סוג עלייה זה לא פעיל"
                                            : assignedPrayer
                                              ? "שנה מתפלל"
                                              : "הקצה מתפלל"
                                        }
                                      >
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            disabled={
                                              !type.enabled && !assignedPrayer
                                            }
                                            onClick={() => {
                                              setSelectedAliyaTypeForAssignment(
                                                type.id
                                              );
                                              setShowPrayerSelectionDialog(
                                                true
                                              );
                                            }}
                                          >
                                            {assignedPrayer ? (
                                              <EditIcon />
                                            ) : (
                                              <AddIcon />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      {assignedPrayer && (
                                        <Tooltip title="הסר הקצאה">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                              // Check if this is a new assignment in the form or existing in DB
                                              if (values.assignments[type.id]) {
                                                // It's in the form, just remove it from form state
                                                const newAssignments = {
                                                  ...values.assignments,
                                                };
                                                delete newAssignments[type.id];
                                                setFieldValue(
                                                  "assignments",
                                                  newAssignments
                                                );
                                              } else {
                                                // It's in the database, mark for deletion
                                                const newDeletions = [
                                                  ...values.deletions,
                                                  type.id,
                                                ];
                                                setFieldValue(
                                                  "deletions",
                                                  newDeletions
                                                );
                                              }
                                            }}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Second row: Assigned prayer (only if assigned) */}
                                  {assignedPrayer && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mt: 1,
                                      }}
                                    >
                                      {assignedPrayer.isChild ? (
                                        <ChildIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      ) : (
                                        <PersonIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      )}
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {assignedPrayer.prayer.firstName}{" "}
                                        {assignedPrayer.prayer.lastName}
                                      </Typography>
                                      {assignedPrayer.isChild && (
                                        <Chip
                                          label="ילד"
                                          size="small"
                                          color="secondary"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </Stack>
                    </Box>
                  )}
                </Stack>
                <DialogActions>
                  <Button
                    type="button"
                    onClick={() => setShowAssignmentDialog(false)}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      isSubmitting || updatePrayerCardMutation.isPending
                    }
                  >
                    {isSubmitting || updatePrayerCardMutation.isPending
                      ? "שומר..."
                      : "שמור שינויים"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Prayer Selection Dialog */}
      <Dialog
        open={showPrayerSelectionDialog}
        onClose={() => {
          setShowPrayerSelectionDialog(false);
          setSelectedAliyaTypeForAssignment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>בחר מתפלל</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              options={allPrayers}
              getOptionLabel={({ prayer }) =>
                `${prayer.firstName} ${prayer.lastName}`
              }
              value={
                selectedAliyaTypeForAssignment &&
                (assignmentFormikRef.current || editGroupFormikRef.current)
                  ? (() => {
                      const activeFormik =
                        assignmentFormikRef.current ||
                        editGroupFormikRef.current;
                      const prayerId =
                        activeFormik?.values.assignments[
                          selectedAliyaTypeForAssignment
                        ];
                      return prayerId
                        ? allPrayers.find(p => p.prayer.id === prayerId) || null
                        : null;
                    })()
                  : null
              }
              onChange={(_, newValue) => {
                if (selectedAliyaTypeForAssignment && newValue) {
                  const activeFormik =
                    assignmentFormikRef.current || editGroupFormikRef.current;
                  if (activeFormik) {
                    const newAssignments = {
                      ...activeFormik.values.assignments,
                    };
                    newAssignments[selectedAliyaTypeForAssignment] =
                      newValue.prayer.id;
                    activeFormik.setFieldValue("assignments", newAssignments);
                    setShowPrayerSelectionDialog(false);
                    setSelectedAliyaTypeForAssignment(null);
                  }
                }
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="חפש מתפלל"
                  placeholder="הקלד שם..."
                  autoFocus
                />
              )}
              renderOption={(props, { prayer, isChild }) => (
                <li {...props} key={prayer.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {isChild ? <ChildIcon /> : <PersonIcon />}
                    <Typography>
                      {prayer.firstName} {prayer.lastName}
                    </Typography>
                    {isChild && (
                      <Chip
                        label="ילד"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) =>
                option.prayer.id === value.prayer.id
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowPrayerSelectionDialog(false);
              setSelectedAliyaTypeForAssignment(null);
            }}
          >
            ביטול
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reassign Aliya Dialog */}
      <Dialog
        open={showReassignDialog}
        onClose={() => setShowReassignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>העבר עלייה למתפלל אחר</DialogTitle>
        <DialogContent>
          {editingAliya && (
            <Formik
              initialValues={initialReassignmentFormValues}
              validationSchema={reassignmentValidationSchema}
              onSubmit={handleReassignAliya}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
              }) => (
                <Form>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        עלייה נוכחית:
                      </Typography>
                      <Typography variant="body2">
                        {editingAliya.prayer.firstName}{" "}
                        {editingAliya.prayer.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        קבוצה:{" "}
                        {aliyaGroups?.find(
                          g => g.id === editingAliya.aliya.aliyaGroupId
                        )?.label || editingAliya.aliya.aliyaGroupId}
                      </Typography>
                    </Box>

                    <Autocomplete
                      fullWidth
                      options={allPrayers.filter(
                        ({ prayer }) => prayer.id !== editingAliya.prayer.id
                      )}
                      getOptionLabel={({ prayer }) =>
                        `${prayer.firstName} ${prayer.lastName}`
                      }
                      value={
                        allPrayers.find(
                          p => p.prayer.id === values.assignedPrayerId
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        handleChange({
                          target: {
                            name: "assignedPrayerId",
                            value: newValue?.prayer.id || "",
                          },
                        });
                      }}
                      onBlur={handleBlur}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="חפש מתפלל חדש"
                          placeholder="הקלד שם..."
                          error={
                            touched.assignedPrayerId &&
                            Boolean(errors.assignedPrayerId)
                          }
                        />
                      )}
                      renderOption={(
                        props,
                        { prayer, isChild, parentName }
                      ) => (
                        <li {...props} key={prayer.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {isChild ? <ChildIcon /> : <PersonIcon />}
                            <Typography>
                              {prayer.firstName} {prayer.lastName}
                            </Typography>
                            {isChild && (
                              <Chip
                                label="ילד"
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                            {isChild && parentName && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                (בן/בת של {parentName})
                              </Typography>
                            )}
                          </Box>
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option.prayer.id === value.prayer.id
                      }
                    />
                  </Stack>
                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowReassignDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || updatePrayerCardMutation.isPending
                      }
                    >
                      {isSubmitting || updatePrayerCardMutation.isPending
                        ? "מעביר..."
                        : "העבר עלייה"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog
        open={showEditGroupDialog}
        onClose={() => setShowEditGroupDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>הוסף עליות לקבוצה</DialogTitle>
        <DialogContent>
          {editingGroup && (
            <Formik
              initialValues={initialEditGroupFormValues}
              validationSchema={editGroupValidationSchema}
              onSubmit={handleEditGroupSubmit}
              innerRef={editGroupFormikRef}
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
                    <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        קבוצה נוכחית:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={editingGroup.label}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <CalendarIcon />
                        <Typography variant="body2">
                          {editingGroup.hebrewDate.toString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        סוגי עליות
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        לחץ על הכפתור ליד כל עלייה כדי להקצות מתפלל
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        {aliyaTypes
                          ?.sort(
                            (a, b) =>
                              (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .filter(type => {
                            // Show enabled types
                            if (type.enabled) return true;

                            // For disabled types, only show if they have an existing assignment in this group
                            const hasExistingAssignment = allAliyot.some(
                              aliyaData =>
                                aliyaData.aliya.aliyaGroupId ===
                                  editingGroup.id &&
                                aliyaData.aliya.aliyaType === type.id
                            );
                            return hasExistingAssignment;
                          })
                          .map(type => {
                            // Check if this aliya type is marked for deletion
                            const isMarkedForDeletion =
                              values.deletions.includes(type.id);

                            // First check if there's a new assignment in the form
                            let assignedPrayerId = values.assignments[type.id];

                            // If not and not marked for deletion, check if there's an existing assignment in the database
                            if (!assignedPrayerId && !isMarkedForDeletion) {
                              const existingAliya = allAliyot.find(
                                aliyaData =>
                                  aliyaData.aliya.aliyaGroupId ===
                                    editingGroup.id &&
                                  aliyaData.aliya.aliyaType === type.id
                              );
                              if (existingAliya) {
                                assignedPrayerId = existingAliya.prayer.id;
                              }
                            }

                            const assignedPrayer = assignedPrayerId
                              ? allPrayers.find(
                                  p => p.prayer.id === assignedPrayerId
                                )
                              : null;

                            return (
                              <Card key={type.id} variant="outlined">
                                <CardContent sx={{ py: 1, px: 2 }}>
                                  {/* First row: Aliya type name and buttons */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography variant="h6">
                                      {type.displayName}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Tooltip
                                        title={
                                          !type.enabled && !assignedPrayer
                                            ? "סוג עלייה זה לא פעיל"
                                            : assignedPrayer
                                              ? "שנה מתפלל"
                                              : "הקצה מתפלל"
                                        }
                                      >
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            disabled={
                                              !type.enabled && !assignedPrayer
                                            }
                                            onClick={() => {
                                              setSelectedAliyaTypeForAssignment(
                                                type.id
                                              );
                                              setShowPrayerSelectionDialog(
                                                true
                                              );
                                            }}
                                          >
                                            {assignedPrayer ? (
                                              <EditIcon />
                                            ) : (
                                              <AddIcon />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      {assignedPrayer && (
                                        <Tooltip title="הסר הקצאה">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                              // Check if this is a new assignment in the form or existing in DB
                                              if (values.assignments[type.id]) {
                                                // It's in the form, just remove it from form state
                                                const newAssignments = {
                                                  ...values.assignments,
                                                };
                                                delete newAssignments[type.id];
                                                setFieldValue(
                                                  "assignments",
                                                  newAssignments
                                                );
                                              } else {
                                                // It's in the database, mark for deletion
                                                const newDeletions = [
                                                  ...values.deletions,
                                                  type.id,
                                                ];
                                                setFieldValue(
                                                  "deletions",
                                                  newDeletions
                                                );
                                              }
                                            }}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Second row: Assigned prayer (only if assigned) */}
                                  {assignedPrayer && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mt: 1,
                                      }}
                                    >
                                      {assignedPrayer.isChild ? (
                                        <ChildIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      ) : (
                                        <PersonIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      )}
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {assignedPrayer.prayer.firstName}{" "}
                                        {assignedPrayer.prayer.lastName}
                                      </Typography>
                                      {assignedPrayer.isChild && (
                                        <Chip
                                          label="ילד"
                                          size="small"
                                          color="secondary"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </Stack>
                    </Box>
                  </Stack>

                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowEditGroupDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || updatePrayerCardMutation.isPending
                      }
                    >
                      {isSubmitting || updatePrayerCardMutation.isPending
                        ? "שומר..."
                        : "שמור שינויים"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Aliya Group Dialog */}
      <Dialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>הוסף קבוצת עליות חדשה</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialAliyaGroupFormValues}
            validationSchema={aliyaGroupValidationSchema}
            onSubmit={handleCreateAliyaGroup}
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
                  <Button
                    type="button"
                    onClick={() => setShowCreateGroupDialog(false)}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      isSubmitting || createAliyaGroupMutation.isPending
                    }
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

      {/* Edit Group Details Dialog */}
      <Dialog
        open={showEditGroupDetailsDialog}
        onClose={() => setShowEditGroupDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ערוך פרטי קבוצה</DialogTitle>
        <DialogContent>
          {editingGroup && (
            <Formik<AliyaGroupFormValues>
              initialValues={{
                label: editingGroup.label,
                hebrewDate: editingGroup.hebrewDate,
              }}
              validationSchema={aliyaGroupValidationSchema}
              onSubmit={handleUpdateAliyaGroup}
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
                    <Button
                      type="button"
                      onClick={() => setShowEditGroupDetailsDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || updateAliyaGroupMutation.isPending
                      }
                    >
                      {isSubmitting || updateAliyaGroupMutation.isPending
                        ? "מעדכן..."
                        : "עדכן קבוצה"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const AdminAliyaAssignmentPage: React.FC = () => {
  return <AdminAliyaAssignmentContent />;
};

export default AdminAliyaAssignmentPage;

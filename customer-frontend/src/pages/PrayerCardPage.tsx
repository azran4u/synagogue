import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Event as EventIcon,
  ChildCare as ChildCareIcon,
  Group as GroupIcon,
  AccountBalanceWallet as DonationsIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { usePrayerCard, useCreatePrayerCard } from "../hooks/usePrayerCard";
import { PrayerCard, Prayer } from "../model/Prayer";
import { PrayerEvent } from "../model/PrayerEvent";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { PrayerCardEditDialog } from "../components/PrayerCardEditDialog";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { formatCurrency } from "../utils/donationStats";
import { WithLogin } from "../components/WithLogin";

const PrayerCardContent: React.FC = () => {
  const { data: prayerCard, isLoading } = usePrayerCard();
  const createPrayerMutation = useCreatePrayerCard();
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const { data: aliyaTypes } = useAliyaTypes();
  const { data: aliyaGroups } = useAliyaGroups();
  const navigate = useSynagogueNavigate();
  const { data: synagogue } = useSelectedSynagogue();
  // State for editing
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleCreatePrayerCard = async (prayerCard: PrayerCard) => {
    try {
      await createPrayerMutation.mutateAsync(prayerCard);
      setShowCreateDialog(false);
      navigate("");
    } catch (error) {
      console.error("Error creating prayer card:", error);
    }
  };

  const handleEditPrayerCard = () => {
    setShowEditDialog(true);
  };

  const handleSavePrayerCard = async (updatedPrayerCard: PrayerCard) => {
    await createPrayerMutation.mutateAsync(updatedPrayerCard);
  };

  const handleBackToHome = () => {
    navigate("");
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען כרטיס מתפלל...
        </Typography>
      </Box>
    );
  }

  // If user has a prayer card, show it
  if (prayerCard) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
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
            sx={{
              textAlign: "center",
              order: { xs: 2, sm: 1 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            כרטיס המתפלל שלי
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "space-between", sm: "flex-end" },
              width: { xs: "100%", sm: "auto" },
              order: { xs: 1, sm: 2 },
            }}
          >
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditPrayerCard}
              sx={{
                mr: { xs: 1, sm: 2 },
                flex: { xs: 1, sm: "none" },
                maxWidth: { xs: "48%", sm: "none" },
              }}
            >
              ערוך
            </Button>
            <Button
              variant="outlined"
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

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Personal Information */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonIcon />
                פרטים אישיים
              </Typography>

              <Typography variant="h5" gutterBottom>
                {prayerCard.prayer.firstName} {prayerCard.prayer.lastName}
              </Typography>

              <Stack spacing={1} sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 100 }}
                  >
                    תאריך לידה:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {prayerCard.prayer.hebrewBirthDate
                      ? prayerCard.prayer.hebrewBirthDate.toString()
                      : "לא צוין"}
                  </Typography>
                </Box>

                {prayerCard.prayer.phoneNumber && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      טלפון:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.phoneNumber}
                    </Typography>
                  </Box>
                )}

                {prayerCard.prayer.email && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      אימייל:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.email}
                    </Typography>
                  </Box>
                )}

                {prayerCard.prayer.notes && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      הערות:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {prayerCard.prayer.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Children */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ChildCareIcon />
                ילדים ({prayerCard.children.length})
              </Typography>

              {prayerCard.children.length > 0 ? (
                <Stack spacing={2}>
                  {prayerCard.children.map((child, index) => (
                    <Card key={index} variant="outlined">
                      <CardContent>
                        <Typography variant="h6">
                          {child.firstName} {child.lastName}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ ml: 1, fontWeight: 400 }}
                          >
                            בן/בת {prayerCard.prayer.firstName}{" "}
                            {prayerCard.prayer.lastName}
                          </Typography>
                        </Typography>

                        <Stack spacing={1} sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ minWidth: 100 }}
                            >
                              תאריך לידה:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {child.hebrewBirthDate
                                ? child.hebrewBirthDate.toString()
                                : "לא צוין"}
                            </Typography>
                          </Box>

                          {child.phoneNumber && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                טלפון:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.phoneNumber}
                              </Typography>
                            </Box>
                          )}

                          {child.email && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                אימייל:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.email}
                              </Typography>
                            </Box>
                          )}

                          {child.notes && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ minWidth: 100 }}
                              >
                                הערות:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {child.notes}
                              </Typography>
                            </Box>
                          )}

                          {/* Child's Donations - Only show if feature is enabled */}
                          {synagogue?.isDonationTrackingEnabled &&
                            child.donations.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="primary"
                                  gutterBottom
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <DonationsIcon sx={{ fontSize: 16 }} />
                                  תרומות וחובות של {child.firstName} (
                                  {child.donations.length})
                                </Typography>
                                <Stack spacing={1}>
                                  {/* Paid Donations */}
                                  {child.paidDonations.length > 0 && (
                                    <Stack spacing={0.5}>
                                      <Typography
                                        variant="caption"
                                        color="success.main"
                                      >
                                        שולמו ({child.paidDonations.length})
                                      </Typography>
                                      {child.paidDonations.map(donation => (
                                        <Box
                                          key={donation.id}
                                          sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: "success.light",
                                            borderRadius: 1,
                                            backgroundColor: "success.light",
                                            opacity: 0.8,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              mb: donation.notes ? 0.5 : 0,
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              color="success.dark"
                                              sx={{ fontWeight: 500 }}
                                            >
                                              {donation.formattedAmount}
                                            </Typography>
                                            <Chip
                                              label={donation.hebrewDate.toString()}
                                              size="small"
                                              color="success"
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.7rem",
                                              }}
                                            />
                                          </Box>
                                          {donation.notes && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {donation.notes}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Stack>
                                  )}

                                  {/* Unpaid Donations */}
                                  {child.unpaidDonations.length > 0 && (
                                    <Stack spacing={0.5}>
                                      <Typography
                                        variant="caption"
                                        color="error.main"
                                      >
                                        לא שולמו ({child.unpaidDonations.length}
                                        )
                                      </Typography>
                                      {child.unpaidDonations.map(donation => (
                                        <Box
                                          key={donation.id}
                                          sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor: donation.isOverdue
                                              ? "error.dark"
                                              : "error.light",
                                            borderRadius: 1,
                                            backgroundColor: donation.isOverdue
                                              ? "error.light"
                                              : "background.paper",
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              mb: donation.notes ? 0.5 : 0,
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              color={
                                                donation.isOverdue
                                                  ? "error.dark"
                                                  : "error.main"
                                              }
                                              sx={{ fontWeight: 500 }}
                                            >
                                              {donation.formattedAmount}
                                            </Typography>
                                            <Chip
                                              label={donation.hebrewDate.toString()}
                                              size="small"
                                              color={
                                                donation.isOverdue
                                                  ? "error"
                                                  : "warning"
                                              }
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.7rem",
                                              }}
                                            />
                                            {donation.isOverdue && (
                                              <Chip
                                                label="איחור"
                                                size="small"
                                                color="error"
                                                sx={{
                                                  height: 20,
                                                  fontSize: "0.7rem",
                                                  fontWeight: "bold",
                                                }}
                                              />
                                            )}
                                          </Box>
                                          {donation.notes && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {donation.notes}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Stack>
                                  )}

                                  {/* Total for child */}
                                  {child.totalUnpaidAmount > 0 && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        p: 1,
                                        backgroundColor: "error.light",
                                        borderRadius: 1,
                                        textAlign: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="error.dark"
                                        sx={{ fontWeight: 500 }}
                                      >
                                        חוב כולל:{" "}
                                        {formatCurrency(
                                          child.totalUnpaidAmount
                                        )}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </Box>
                            )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  אין ילדים רשומים
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Events */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <EventIcon />
                אירועים ({prayerCard.prayer.events.length})
              </Typography>

              {prayerCard.prayer.events.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {prayerCard.prayer.events.map((event, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor: "background.paper",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          mb: event.notes ? 1 : 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <Chip
                            label={
                              prayerEventTypes?.find(
                                type => type.id === event.type
                              )?.displayName || event.type
                            }
                            size="small"
                            color="primary"
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {event.hebrewDate.toString()}
                          </Typography>
                        </Box>
                      </Box>

                      {event.notes && (
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontWeight: 500,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            הערות:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.4,
                              wordBreak: "break-word",
                            }}
                          >
                            {event.notes}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", mt: 2 }}
                >
                  אין אירועים רשומים
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Aliyot History */}
          <Card>
            <CardContent>
              {(() => {
                const allAliyot = [
                  ...prayerCard.prayer.aliyot.map(aliya => ({
                    aliya,
                    person: prayerCard.prayer,
                    isChild: false,
                  })),
                  ...prayerCard.children.flatMap(child =>
                    child.aliyot.map(aliya => ({
                      aliya,
                      person: child,
                      isChild: true,
                    }))
                  ),
                ].sort((a, b) => {
                  const groupA = aliyaGroups?.find(
                    g => g.id === a.aliya.aliyaGroupId
                  );
                  const groupB = aliyaGroups?.find(
                    g => g.id === b.aliya.aliyaGroupId
                  );
                  return (groupA?.hebrewDate.toString() || "").localeCompare(
                    groupB?.hebrewDate.toString() || ""
                  );
                });

                return (
                  <>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <GroupIcon />
                      עליות ({allAliyot.length})
                    </Typography>

                    {allAliyot.length > 0 ? (
                      <Stack spacing={2}>
                        {allAliyot.map(({ aliya, person, isChild }, index) => {
                          const aliyaType = aliyaTypes?.find(
                            type => type.id === aliya.aliyaType
                          );
                          const aliyaGroup = aliyaGroups?.find(
                            group => group.id === aliya.aliyaGroupId
                          );
                          return (
                            <Box
                              key={`${person.id}-${aliya.aliyaGroupId}-${aliya.aliyaType}`}
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                                gap: { xs: 1, sm: 2 },
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                backgroundColor: "background.paper",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  minWidth: { xs: "auto", sm: 120 },
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {person.firstName} {person.lastName}
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
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  gap: { xs: 1, sm: 2 },
                                  flex: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {aliyaGroup && (
                                    <Chip
                                      label={aliyaGroup.label}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  )}
                                  <Chip
                                    label={
                                      aliyaType?.displayName || aliya.aliyaType
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
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                >
                                  {aliyaGroup?.hebrewDate.toString() ||
                                    "תאריך לא ידוע"}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        אין עליות רשומות
                      </Typography>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Donations/Debts Section - Only show if feature is enabled */}
          {synagogue?.isDonationTrackingEnabled && (
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <DonationsIcon />
                  תרומות וחובות ({prayerCard.prayer.donations.length})
                </Typography>

                {prayerCard.prayer.donations.length > 0 ? (
                  <Stack spacing={2}>
                    {/* Paid Donations */}
                    {prayerCard.prayer.paidDonations.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="success.main"
                          gutterBottom
                        >
                          תרומות ששולמו (
                          {prayerCard.prayer.paidDonations.length})
                        </Typography>
                        <Stack spacing={1}>
                          {prayerCard.prayer.paidDonations.map(donation => (
                            <Box
                              key={donation.id}
                              sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: "success.light",
                                borderRadius: 1,
                                backgroundColor: "success.light",
                                opacity: 0.8,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: donation.notes ? 1 : 0,
                                }}
                              >
                                <Typography variant="h6" color="success.dark">
                                  {donation.formattedAmount}
                                </Typography>
                                <Chip
                                  label={donation.hebrewDate.toString()}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                                <Chip
                                  label="שולם"
                                  size="small"
                                  color="success"
                                />
                              </Box>
                              {donation.notes && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {donation.notes}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Unpaid Donations */}
                    {prayerCard.prayer.unpaidDonations.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="error.main"
                          gutterBottom
                        >
                          חובות פתוחים (
                          {prayerCard.prayer.unpaidDonations.length})
                        </Typography>
                        <Stack spacing={1}>
                          {prayerCard.prayer.unpaidDonations.map(donation => (
                            <Box
                              key={donation.id}
                              sx={{
                                p: 2,
                                border: "1px solid",
                                borderColor: donation.isOverdue
                                  ? "error.dark"
                                  : "error.light",
                                borderRadius: 1,
                                backgroundColor: donation.isOverdue
                                  ? "error.light"
                                  : "background.paper",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: donation.notes ? 1 : 0,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  color={
                                    donation.isOverdue
                                      ? "error.dark"
                                      : "error.main"
                                  }
                                >
                                  {donation.formattedAmount}
                                </Typography>
                                <Chip
                                  label={donation.hebrewDate.toString()}
                                  size="small"
                                  color={
                                    donation.isOverdue ? "error" : "warning"
                                  }
                                  variant="outlined"
                                />
                                <Chip
                                  label="לא שולם"
                                  size="small"
                                  color="error"
                                />
                                {donation.isOverdue && (
                                  <Chip
                                    label="איחור"
                                    size="small"
                                    color="error"
                                    sx={{ fontWeight: "bold" }}
                                  />
                                )}
                              </Box>
                              {donation.notes && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mt: 1 }}
                                >
                                  {donation.notes}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Stack>

                        {/* Total Unpaid Amount */}
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: "error.light",
                            borderRadius: 1,
                            textAlign: "center",
                          }}
                        >
                          <Typography variant="h6" color="error.dark">
                            סכום חוב כולל:{" "}
                            {formatCurrency(
                              prayerCard.prayer.totalUnpaidAmount
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Show message if no donations */}
                    {prayerCard.prayer.paidDonations.length === 0 &&
                      prayerCard.prayer.unpaidDonations.length === 0 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontStyle: "italic",
                            textAlign: "center",
                            py: 2,
                          }}
                        >
                          אין תרומות או חובות רשומים
                        </Typography>
                      )}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    אין תרומות או חובות רשומים
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Edit Prayer Card Dialog */}
        <PrayerCardEditDialog
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          prayerCard={prayerCard}
          onSave={handleSavePrayerCard}
          isLoading={createPrayerMutation.isPending}
          title="ערוך כרטיס מתפלל"
        />
      </Box>
    );
  }

  // If user doesn't have a prayer card, show creation option
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">צור כרטיס מתפלל</Typography>
        <Button variant="outlined" onClick={handleBackToHome}>
          חזור לדף הבית
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <PersonIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            התחל את המסע שלך
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            צור את כרטיס המתפלל שלך כדי לנהל את הפרטים האישיים והמשפחתיים
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setShowCreateDialog(true)}
            startIcon={<PersonIcon />}
            sx={{ minWidth: 200 }}
          >
            צור כרטיס מתפלל
          </Button>
        </CardContent>
      </Card>

      {/* Create Prayer Card Dialog */}
      <PrayerCardEditDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        prayerCard={null}
        onSave={handleCreatePrayerCard}
        isLoading={createPrayerMutation.isPending}
        title="צור כרטיס מתפלל"
      />
    </Box>
  );
};

export default () => {
  return (
    <WithLogin>
      <PrayerCardContent />
    </WithLogin>
  );
};

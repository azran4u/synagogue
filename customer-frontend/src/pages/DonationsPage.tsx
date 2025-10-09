import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import { useEnabledDonations } from "../hooks/useDonations";
import { Donation } from "../model/Donation";

const DonationsPage: React.FC = () => {
  const { data: donations, isLoading, error } = useEnabledDonations();

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען דרכי תרומה...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">שגיאה בטעינת דרכי תרומה: {error.message}</Alert>
      </Box>
    );
  }

  const sortedDonations = donations
    ? [...donations].sort(
        (a: Donation, b: Donation) => a.displayOrder - b.displayOrder
      )
    : [];

  const handleDonate = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          תרומות
        </Typography>
        <Typography variant="body1" color="text.secondary">
          תמכו בבית הכנסת שלנו
        </Typography>
      </Box>

      {/* Donations List */}
      {sortedDonations.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <MoneyIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין דרכי תרומה זמינות
            </Typography>
            <Typography variant="body2" color="text.secondary">
              דרכי התרומה יתפרסמו בקרוב
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {sortedDonations.map((donation: Donation) => (
            <Card key={donation.id} elevation={3}>
              <CardContent>
                {/* Donation Title */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <MoneyIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5">{donation.title}</Typography>
                    {donation.isExternalPayment && (
                      <Chip
                        label={`דרך ${donation.paymentServiceName}`}
                        color="info"
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Notes */}
                {donation.notes && (
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ whiteSpace: "pre-line" }}
                    >
                      {donation.notes}
                    </Typography>
                  </Box>
                )}

                {/* Donate Button */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<MoneyIcon />}
                    endIcon={<OpenIcon />}
                    onClick={() => handleDonate(donation.link)}
                    sx={{ minWidth: 200 }}
                  >
                    תרום עכשיו
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default DonationsPage;

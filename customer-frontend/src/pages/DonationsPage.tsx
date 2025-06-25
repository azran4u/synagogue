import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Paper,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  Book as BookIcon,
  ContactPhone as ContactIcon,
  Email as EmailIcon,
  OpenInNew as ExternalLinkIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const DonationsPage: React.FC = () => {
  const handlePayboxClick = () => {
    window.open("https://payboxapp.page.link/nStUwvUBV88mbR4d8", "_blank");
  };

  return (
    <Box p={3} sx={{ textAlign: "center" }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          תרומות לבית הכנסת
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary">
          תמיכה בקהילה ובהרחבת התורה
        </Typography>
      </Box>

      {/* Main Donation Card */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={3}
            sx={{ justifyContent: "center" }}
          >
            <Typography variant="h5" fontWeight="bold">
              תרומה כספית
            </Typography>
            <MoneyIcon color="primary" fontSize="large" />
          </Box>

          <Typography variant="body1" paragraph>
            תרומתכם מסייעת לנו בתפעול השוטף של בית הכנסת ובקידום פעילויות
            הקהילה.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handlePayboxClick}
            startIcon={<ExternalLinkIcon />}
            sx={{
              fontSize: "1.1rem",
              py: 1.5,
              px: 3,
              backgroundColor: "#4CAF50",
              "&:hover": {
                backgroundColor: "#45a049",
              },
            }}
          >
            תרום עכשיו דרך Paybox
          </Button>

          <Typography
            variant="caption"
            display="block"
            mt={1}
            color="text.secondary"
          >
            הקליקו על הכפתור למעבר לאתר התרומות הבטוח
          </Typography>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: "center" }}>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={3}
          sx={{ justifyContent: "center" }}
        >
          <Typography variant="h5" fontWeight="bold">
            מידע חשוב
          </Typography>
          <InfoIcon color="primary" fontSize="large" />
        </Box>

        <Box sx={{ lineHeight: 1.8 }}>
          <Typography variant="body1" paragraph>
            כפי שניתן לראות ב"ה סיימנו את השיפוץ(כמעט...) והודות לתורמים הבאנו
            סיפריה להגדלת התורה ושימוש המתפללים. אנחנו מבקשים שמי שמעוניין לתרום
            ספרים יפנה לפני כן לרב אופיר ולא ישים אותם בספריה על דעת עצמו (חשוב
            לנו להביא מגוון של ספרים שימושיים עד כמה שניתן), במידה ומישהו רוצה
            לתרום כסף לרכישת ספרים יכול לפנות לאלירן צדוק ו/או לדוד דיין.
          </Typography>

          <Typography variant="h6" fontWeight="bold" gutterBottom>
            הוראת קבע לבית הכנסת
          </Typography>

          <Typography variant="body1" paragraph>
            מי שאין לו עדיין הו"ק לבית הכנסת ומעוניין לעדכן תרומה יכול לפנות
            לאלירן צדוק ו/או לדוד דיין. אני מזכיר:
          </Typography>

          <List dense>
            <ListItem sx={{ display: "block" }}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    <strong>א.</strong> אין חובה לעדכן הו"ק, הנ"ל מסייע לנו
                    בתפעול שוטף וקידום בית הכנסת, אין הבדל בין מתפלל שיש לו הו"ק
                    למתפלל שאין לו.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem sx={{ display: "block" }}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    <strong>ב.</strong> אין סכום מינימום להו"ק, ניתן לתרום גם
                    סכום חודשי של 18/26/50 וכן הלאה, כמובן אפשרי גם מכספי מעשר.
                  </Typography>
                }
              />
            </ListItem>

            <ListItem sx={{ display: "block" }}>
              <ListItemText
                primary={
                  <Typography variant="body1">
                    <strong>ג.</strong> גם מי שיש לו הו"ק ומעוניין לבטלה יכול
                    לעשות זאת ללא ח"ו תחושת חוסר נעימות ע"י עדכון של אלירן צדוק
                    ו/או דוד דיין ו/או ע"י שליחת מייל לעדנה ויעל במזכירות
                    היישוב.
                  </Typography>
                }
              />
            </ListItem>
          </List>

          <Typography variant="body1" paragraph>
            הו"ק יורדת דרך מיסי היישוב ומועברת לחשבון בית הכנסת.
          </Typography>
        </Box>
      </Paper>

      {/* Contact Information */}
      <Card elevation={2}>
        <CardContent sx={{ textAlign: "center" }}>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={3}
            sx={{ justifyContent: "center" }}
          >
            <Typography variant="h5" fontWeight="bold">
              פרטי קשר
            </Typography>
            <ContactIcon color="primary" fontSize="large" />
          </Box>

          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              md: "repeat(2, 1fr)",
            }}
            gap={3}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                תרומת ספרים
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                sx={{ justifyContent: "center" }}
              >
                <BookIcon color="primary" />
                <Typography variant="body1">הרב אופיר</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                תרומה כספית לרכישת ספרים
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                sx={{ justifyContent: "center" }}
              >
                <MoneyIcon color="primary" />
                <Typography variant="body1">אלירן צדוק</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ justifyContent: "center" }}
              >
                <MoneyIcon color="primary" />
                <Typography variant="body1">דוד דיין</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                הוראת קבע
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                sx={{ justifyContent: "center" }}
              >
                <ContactIcon color="primary" />
                <Typography variant="body1">אלירן צדוק</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ justifyContent: "center" }}
              >
                <ContactIcon color="primary" />
                <Typography variant="body1">דוד דיין</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                ביטול הוראת קבע
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
                sx={{ justifyContent: "center" }}
              >
                <EmailIcon color="primary" />
                <Typography variant="body1">
                  עדנה ויעל במזכירות היישוב
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>חשוב:</strong> כל התרומות מועברות ישירות לחשבון בית הכנסת
          ומשמשות לתפעול השוטף ולקידום פעילויות הקהילה.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DonationsPage;

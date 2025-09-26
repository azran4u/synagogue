import React from "react";
import { Box, Typography, Alert, Button } from "@mui/material";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useAuth } from "../hooks/useAuth";

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({
  children,
  fallback,
}) => {
  const { isLoggedIn, user } = useAuth();
  const isAdmin = useIsAdmin();

  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          עליך להתחבר כדי לגשת לעמוד זה
        </Alert>
        <Typography variant="body1" color="text.secondary">
          המשתמש הנוכחי: {user?.email || "לא מחובר"}
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      fallback || (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            אין לך הרשאות לגשת לעמוד זה
          </Alert>
          <Typography variant="body1" color="text.secondary">
            עמוד זה זמין רק למנהלי המערכת
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            המשתמש הנוכחי: {user?.email}
          </Typography>
        </Box>
      )
    );
  }

  return <>{children}</>;
};

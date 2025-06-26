import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            p: 3,
            maxWidth: 600,
            mx: "auto",
            mt: 4,
            textAlign: "center",
          }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              משהו השתבש
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              אירעה שגיאה לא צפויה. אנא נסה לרענן את הדף או לחזור לדף הבית.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" color="text.secondary">
                שגיאה: {this.state.error.message}
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" onClick={this.handleReload}>
              רענן דף
            </Button>
            <Button variant="outlined" onClick={this.handleGoHome}>
              חזור לדף הבית
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

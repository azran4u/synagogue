import Typography from "@mui/material/Typography";
import { Box, Button, CircularProgress, Link } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { useAdminActions } from "../hooks/useAdminActions";
import { useOrdersCount } from "../hooks/useOrdersCount";

const AdminPage = () => {
  const title = "מנהלים";

  const { isLoading, login, logout, error, isLoggedIn, user } = useAuth();
  const {
    sync,
    syncLoading,
    syncData,
    syncError,
    exportFn,
    exportData,
    exportError,
    exportLoading,
  } = useAdminActions();

  const { count } = useOrdersCount();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {isLoading && <CircularProgress />}
      {error && <Typography>{error.message}</Typography>}
      {isLoggedIn ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <Typography variant="body1" gutterBottom>
              מחובר: {user?.displayName}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              onClick={logout}
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                color: "blue",
              }}
            >
              (התנתק)
            </Typography>
          </Box>
          {syncLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Button variant="contained" onClick={() => sync()}>
                סנכרון
              </Button>
              {syncData && <Typography>הסנכרון בוצע בהצלחה</Typography>}
              {syncError && (
                <Typography color="error">
                  {JSON.stringify(syncError)}
                </Typography>
              )}
            </>
          )}
          {exportLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Button variant="contained" onClick={() => exportFn()}>
                יצא נתונים
              </Button>
              {exportData && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Link href={exportData} target="_blank" rel="noopener">
                    <Typography>קישור לקובץ אקסל</Typography>
                  </Link>
                </Box>
              )}
              {exportError && (
                <Typography>{JSON.stringify(exportError)}</Typography>
              )}
            </>
          )}
          {count && (
            <Typography variant="body1" gutterBottom>
              ישנם {count} הזמנות
            </Typography>
          )}
        </>
      ) : (
        <Button variant="contained" onClick={() => login()}>
          Login
        </Button>
      )}
    </Box>
  );
};

export default AdminPage;

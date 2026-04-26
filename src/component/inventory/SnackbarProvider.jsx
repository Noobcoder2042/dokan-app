import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const SnackbarContext = createContext(null);

export const useAppSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useAppSnackbar must be used inside SnackbarProvider");
  }
  return context;
};

const SnackbarProvider = ({ children }) => {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback((message, severity = "success") => {
    setSnackbarState({
      open: true,
      message,
      severity,
    });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbarState((current) => ({ ...current, open: false }));
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={2800}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;

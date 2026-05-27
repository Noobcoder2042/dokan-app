import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box, Typography } from "@mui/material";

export const AdminGuard = ({ children }) => {
  const { profile, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress color="success" />
        <Typography variant="body2" color="text.secondary">Verifying secure admin clearance...</Typography>
      </Box>
    );
  }

  // Double-verify role claim. Redirect to main POS desk if role is not admin.
  if (!profile || profile.role !== "admin") {
    console.warn(`[SECURITY WARN] Unauthorized route entry attempted at /admin by:`, profile?.email || "Guest");
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminGuard;

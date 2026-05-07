import { Component } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
          <Paper sx={{ p: 3, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <Typography variant="h5">Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
              The app hit an unexpected error. Reload to continue working.
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={this.handleReload}>
              Reload App
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

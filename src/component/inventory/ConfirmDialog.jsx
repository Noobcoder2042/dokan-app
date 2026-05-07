import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  warningText = "",
  onConfirm,
  onCancel,
  loading = false,
}) => (
  <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
      {warningText ? (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {warningText}
        </Alert>
      ) : null}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onCancel} disabled={loading} color="inherit">
        {cancelText}
      </Button>
      <Button onClick={onConfirm} disabled={loading} variant="contained" color="error">
        {confirmText}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

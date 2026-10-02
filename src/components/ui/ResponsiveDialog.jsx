import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Stack,
  Slide,
  useMediaQuery,
  useTheme,
  Box,
  alpha,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ResponsiveDialog
 * Renders as fullScreen or bottom sheet on mobile (<600px/sm) and centered dialog on desktop.
 */
const ResponsiveDialog = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  mobileVariant = "fullscreen", // "fullscreen" | "sheet"
  PaperProps = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isSheet = isMobile && mobileVariant === "sheet";
  const isFullScreen = isMobile && mobileVariant === "fullscreen";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isFullScreen}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={isMobile ? Transition : undefined}
      PaperProps={{
        ...PaperProps,
        sx: {
          ...(isSheet
            ? {
                m: 0,
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                width: "100%",
                maxHeight: "88vh",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : isFullScreen
            ? {
                m: 0,
                borderRadius: 0,
              }
            : {
                borderRadius: 3,
              }),
          ...PaperProps.sx,
        },
      }}
      {...props}
    >
      {/* Drag handle pill for sheet variant on mobile */}
      {isSheet && (
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              bgcolor: "divider",
            }}
          />
        </Box>
      )}

      {(title || subtitle) && (
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            pt: isSheet ? 1 : { xs: 2, sm: 2.5 },
            pb: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              {typeof title === "string" ? (
                <Typography variant="h6" fontWeight={750} noWrap>
                  {title}
                </Typography>
              ) : (
                title
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={onClose}
              size="medium"
              sx={{
                width: 44,
                height: 44,
                color: "text.secondary",
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.08) },
              }}
              aria-label="close"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2.5,
          overflowY: "auto",
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 1,
            flexWrap: "wrap",
            pb: isMobile ? "calc(16px + env(safe-area-inset-bottom))" : 2,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ResponsiveDialog;

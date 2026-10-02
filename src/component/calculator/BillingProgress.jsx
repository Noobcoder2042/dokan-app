import React from "react";
import { Box, ButtonBase, Paper, Stack, Typography, alpha, useTheme } from "@mui/material";

/**
 * BillingProgress
 * Compact mobile step indicator: ✓ Customer ── ● Items ── ○ Summary
 * Replaces large segmented tab controls with a touch-friendly progress bar.
 */
const BillingProgress = ({
  currentStep = 0,
  onStepClick,
  isCustomerCompleted = false,
  isItemsCompleted = false,
}) => {
  const theme = useTheme();

  const steps = [
    { label: "Customer", index: 0, completed: isCustomerCompleted },
    { label: "Add Items", index: 1, completed: isItemsCompleted },
    { label: "Summary", index: 2, completed: false },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1,
        py: 0.75,
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.background.paper, 0.75),
        border: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {steps.map((step, idx) => {
          const isCurrent = currentStep === step.index;
          const isPast = step.completed && !isCurrent;

          return (
            <React.Fragment key={step.index}>
              <ButtonBase
                onClick={() => onStepClick?.(step.index)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1,
                  py: 0.75,
                  minHeight: 40,
                  borderRadius: 2,
                  bgcolor: isCurrent ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                  transition: "all 0.2s ease",
                  "&:active": {
                    transform: "scale(0.96)",
                  },
                }}
              >
                {/* Step Circle Indicator */}
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 850,
                    bgcolor: isCurrent
                      ? "primary.main"
                      : isPast
                      ? "success.main"
                      : alpha(theme.palette.text.secondary, 0.15),
                    color: isCurrent || isPast ? "white" : "text.secondary",
                    boxShadow: isCurrent
                      ? `0 2px 6px ${alpha(theme.palette.primary.main, 0.35)}`
                      : "none",
                  }}
                >
                  {isPast ? "✓" : step.index + 1}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isCurrent ? 800 : isPast ? 700 : 500,
                    color: isCurrent
                      ? "primary.main"
                      : isPast
                      ? "text.primary"
                      : "text.secondary",
                    fontSize: "0.78rem",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.label}
                </Typography>
              </ButtonBase>

              {/* Connecting Line between steps */}
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    flexGrow: 1,
                    height: 2,
                    mx: 0.5,
                    borderRadius: 1,
                    bgcolor: step.completed ? "success.main" : theme.palette.divider,
                    transition: "bgcolor 0.25s ease",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default BillingProgress;

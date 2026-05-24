import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PropTypes from "prop-types";

const toneStyles = {
  success: { border: "rgba(74,222,128,0.35)", bg: "rgba(34,197,94,0.08)", chip: "success" },
  warning: { border: "rgba(251,191,36,0.35)", bg: "rgba(245,158,11,0.08)", chip: "warning" },
  info: { border: "rgba(96,165,250,0.28)", bg: "rgba(59,130,246,0.06)", chip: "info" },
};

const typeIcon = {
  forecast: <TrendingUpRoundedIcon fontSize="small" />,
  insight: <PsychologyRoundedIcon fontSize="small" />,
  alert: <WarningAmberRoundedIcon fontSize="small" />,
  action: <BoltRoundedIcon fontSize="small" />,
  tip: <LightbulbRoundedIcon fontSize="small" />,
};

const AIInsightsPanel = ({ aiData, loading, onCardClick }) => {
  const [typedSummary, setTypedSummary] = useState("");
  const [scanning, setScanning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const summary = aiData?.summary || "";

  const replayTyping = () => {
    setScanning(true);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    if (loading || !summary) {
      setTypedSummary("");
      setScanning(false);
      return undefined;
    }

    let index = 0;
    setTypedSummary("");
    setScanning(true);
    const timer = window.setInterval(() => {
      index += 1;
      setTypedSummary(summary.slice(0, index));
      if (index >= summary.length) {
        window.clearInterval(timer);
        setScanning(false);
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [summary, loading, refreshKey]);

  const healthColor = useMemo(() => {
    const score = aiData?.healthScore || 0;
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#4ade80";
    if (score >= 40) return "#fbbf24";
    return "#f97316";
  }, [aiData?.healthScore]);

  return (
    <Card
      sx={{
        overflow: "hidden",
        border: "1px solid rgba(74,222,128,0.22)",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, rgba(10,15,13,0.98) 0%, rgba(18,26,22,0.96) 40%, rgba(12,20,16,0.98) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(236,253,245,0.95) 100%)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "stretch" }}>
          <Box sx={{ minWidth: { md: 220 } }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  boxShadow: "0 0 24px rgba(34,197,94,0.45)",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Dokan AI
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: scanning || loading ? "#fbbf24" : "#22c55e",
                      boxShadow: scanning || loading ? "0 0 12px #fbbf24" : "0 0 12px #22c55e",
                      animation: scanning || loading ? "aiPulse 1s ease-in-out infinite" : "none",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {loading ? "Analyzing bills…" : scanning ? "Generating insights…" : "Live analysis"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Box sx={{ mt: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="caption" color="text.secondary">
                  Shop health score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: healthColor }}>
                  {loading ? "—" : aiData?.healthScore ?? 0}
                </Typography>
              </Stack>
              <LinearProgress
                variant={loading ? "indeterminate" : "determinate"}
                value={loading ? 0 : aiData?.healthScore ?? 0}
                sx={{
                  mt: 1,
                  height: 10,
                  borderRadius: 99,
                  bgcolor: "rgba(148,163,184,0.15)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 99,
                    background: `linear-gradient(90deg, ${healthColor} 0%, #4ade80 100%)`,
                  },
                }}
              />
              <Chip
                size="small"
                label={loading ? "Calculating…" : aiData?.healthLabel || "—"}
                sx={{ mt: 1.25 }}
                color="success"
                variant="outlined"
              />
            </Box>

            <Button size="small" variant="outlined" onClick={replayTyping} sx={{ mt: 2 }} disabled={loading || !summary}>
              Refresh AI summary
            </Button>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body1"
              sx={{
                minHeight: 56,
                fontFamily: "inherit",
                lineHeight: 1.6,
                color: "text.primary",
              }}
            >
              {loading ? "Scanning your sales, customers, and dues…" : typedSummary}
              {!loading && typedSummary.length < summary.length ? (
                <Box component="span" sx={{ opacity: 0.6 }}>
                  |
                </Box>
              ) : null}
            </Typography>

            <GridLikeInsights loading={loading} cards={aiData?.cards || []} onCardClick={onCardClick} />
          </Box>
        </Stack>
      </CardContent>

      <Box
        sx={{
          "@keyframes aiPulse": {
            "0%, 100%": { opacity: 0.5, transform: "scale(0.9)" },
            "50%": { opacity: 1, transform: "scale(1.15)" },
          },
        }}
      />
    </Card>
  );
};

const GridLikeInsights = ({ loading, cards, onCardClick }) => (
  <Box
    sx={{
      mt: 2.5,
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
      gap: 1.5,
    }}
  >
    {loading ? (
      Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={`sk-${i}`}
          sx={{
            height: 108,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            animation: "aiPulse 1.2s ease-in-out infinite",
          }}
        />
      ))
    ) : (
      <AnimatePresence>
        {cards.map((card, index) => {
          const style = toneStyles[card.tone] || toneStyles.info;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
            >
              <Box
                onClick={() => onCardClick?.(card)}
                sx={{
                  p: 1.75,
                  height: "100%",
                  borderRadius: 2,
                  border: `1px solid ${style.border}`,
                  bgcolor: style.bg,
                  cursor: onCardClick ? "pointer" : "default",
                  transition: "transform .2s ease, box-shadow .2s ease",
                  "&:hover": onCardClick
                    ? { transform: "translateY(-2px)", boxShadow: "0 12px 28px rgba(0,0,0,0.12)" }
                    : undefined,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.25 }}>{typeIcon[card.type] || typeIcon.insight}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {card.title}
                      </Typography>
                      <Chip size="small" label={`${card.confidence}%`} color={style.chip} variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.45 }}>
                      {card.message}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={card.confidence}
                      sx={{
                        mt: 1.25,
                        height: 4,
                        borderRadius: 99,
                        bgcolor: "rgba(148,163,184,0.12)",
                        "& .MuiLinearProgress-bar": { borderRadius: 99, bgcolor: healthBarColor(card.tone) },
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </motion.div>
          );
        })}
      </AnimatePresence>
    )}
  </Box>
);

const healthBarColor = (tone) => {
  if (tone === "success") return "#22c55e";
  if (tone === "warning") return "#f59e0b";
  return "#60a5fa";
};

AIInsightsPanel.propTypes = {
  aiData: PropTypes.shape({
    healthScore: PropTypes.number,
    healthLabel: PropTypes.string,
    summary: PropTypes.string,
    cards: PropTypes.array,
  }),
  loading: PropTypes.bool,
  onCardClick: PropTypes.func,
};

GridLikeInsights.propTypes = {
  loading: PropTypes.bool,
  cards: PropTypes.array,
  onCardClick: PropTypes.func,
};

export default AIInsightsPanel;

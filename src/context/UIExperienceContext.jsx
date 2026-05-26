import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UIExperienceContext = createContext(null);

export const THEME_PRESETS = {
  emerald: {
    name: "Emerald Mint",
    colors: {
      dark: {
        primary: "#4ade80",
        secondary: "#86efac",
        success: "#22c55e",
        background: { default: "#0a0f0d", paper: "#121a17" },
        radial: "rgba(34,197,94,0.14)",
        radialSecondary: "rgba(22,163,74,0.10)",
        linear: "linear-gradient(180deg,#0a0f0d 0%, #0d1411 52%, #0a0f0d 100%)",
      },
      light: {
        primary: "#15803d",
        secondary: "#166534",
        success: "#16a34a",
        background: { default: "#f6f8f7", paper: "#ffffff" },
        radial: "rgba(34,197,94,0.10)",
        radialSecondary: "rgba(22,163,74,0.08)",
        linear: "linear-gradient(180deg,#f8faf9 0%, #f0f5f2 48%, #ecf2ee 100%)",
      }
    }
  },
  obsidian: {
    name: "Midnight Obsidian",
    colors: {
      dark: {
        primary: "#818cf8",
        secondary: "#a5b4fc",
        success: "#4f46e5",
        background: { default: "#030712", paper: "#0b0f19" },
        radial: "rgba(99,102,241,0.15)",
        radialSecondary: "rgba(79,70,229,0.10)",
        linear: "linear-gradient(180deg,#030712 0%, #080c18 52%, #030712 100%)",
      },
      light: {
        primary: "#4f46e5",
        secondary: "#3730a3",
        success: "#4338ca",
        background: { default: "#f8fafc", paper: "#ffffff" },
        radial: "rgba(99,102,241,0.10)",
        radialSecondary: "rgba(79,70,229,0.06)",
        linear: "linear-gradient(180deg,#fcfdfe 0%, #f1f5f9 48%, #e2e8f0 100%)",
      }
    }
  },
  sunset: {
    name: "Cyber Sunset",
    colors: {
      dark: {
        primary: "#fb7185",
        secondary: "#fda4af",
        success: "#f43f5e",
        background: { default: "#090506", paper: "#12080a" },
        radial: "rgba(244,63,94,0.15)",
        radialSecondary: "rgba(249,115,22,0.08)",
        linear: "linear-gradient(180deg,#090506 0%, #12090b 52%, #090506 100%)",
      },
      light: {
        primary: "#e11d48",
        secondary: "#9f1239",
        success: "#be123c",
        background: { default: "#fff5f5", paper: "#ffffff" },
        radial: "rgba(244,63,94,0.08)",
        radialSecondary: "rgba(249,115,22,0.05)",
        linear: "linear-gradient(180deg,#fffafb 0%, #ffeef0 48%, #ffd1d6 100%)",
      }
    }
  },
  ocean: {
    name: "Ocean Breeze",
    colors: {
      dark: {
        primary: "#38bdf8",
        secondary: "#7dd3fc",
        success: "#0ea5e9",
        background: { default: "#020813", paper: "#081022" },
        radial: "rgba(14,165,233,0.14)",
        radialSecondary: "rgba(3,105,161,0.08)",
        linear: "linear-gradient(180deg,#020813 0%, #051025 52%, #020813 100%)",
      },
      light: {
        primary: "#0284c7",
        secondary: "#0369a1",
        success: "#0369a1",
        background: { default: "#f0f9ff", paper: "#ffffff" },
        radial: "rgba(14,165,233,0.08)",
        radialSecondary: "rgba(3,105,161,0.05)",
        linear: "linear-gradient(180deg,#f7fcff 0%, #e0f2fe 48%, #bae6fd 100%)",
      }
    }
  },
  vintage: {
    name: "Vintage Sepia",
    colors: {
      dark: {
        primary: "#f59e0b",
        secondary: "#fbbf24",
        success: "#d97706",
        background: { default: "#0f0d0a", paper: "#18140f" },
        radial: "rgba(217,119,6,0.14)",
        radialSecondary: "rgba(180,83,9,0.08)",
        linear: "linear-gradient(180deg,#0f0d0a 0%, #15110d 52%, #0f0d0a 100%)",
      },
      light: {
        primary: "#b45309",
        secondary: "#78350f",
        success: "#92400e",
        background: { default: "#faf9f6", paper: "#ffffff" },
        radial: "rgba(217,119,6,0.08)",
        radialSecondary: "rgba(180,83,9,0.05)",
        linear: "linear-gradient(180deg,#fefefe 0%, #f5f4ef 48%, #ebe9e0 100%)",
      }
    }
  },
  bmw: {
    name: "BMW M-Power",
    colors: {
      dark: {
        primary: "#ffffff",
        secondary: "#bbbbbb",
        success: "#0fa336",
        background: { default: "#000000", paper: "#1a1a1a" },
        radial: "rgba(0,102,177,0.18)",
        radialSecondary: "rgba(226,39,24,0.14)",
        linear: "linear-gradient(180deg,#000000 0%, #0d0d0d 52%, #000000 100%)",
      },
      light: {
        primary: "#ffffff",
        secondary: "#bbbbbb",
        success: "#0fa336",
        background: { default: "#000000", paper: "#1a1a1a" },
        radial: "rgba(0,102,177,0.18)",
        radialSecondary: "rgba(226,39,24,0.14)",
        linear: "linear-gradient(180deg,#000000 0%, #0d0d0d 52%, #000000 100%)",
      }
    }
  }
};

const getStoredBoolean = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === "true";
};

let sharedAudioContext = null;
let audioUnlocked = false;

const getAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
};

const unlockAudio = async () => {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state !== "running") {
      await ctx.resume();
    }
    audioUnlocked = ctx.state === "running";
  } catch {
    audioUnlocked = false;
  }
  return audioUnlocked;
};

const createTone = (frequency = 660, durationMs = 60, volume = 0.03, type = "sine") => {
  const ctx = getAudioContext();
  if (!ctx || !audioUnlocked || ctx.state !== "running") return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  oscillator.stop(ctx.currentTime + durationMs / 1000);
};

const SOUND_PRESETS = {
  startup: () => {
    createTone(480, 90, 0.03, "triangle");
    setTimeout(() => createTone(720, 110, 0.02, "sine"), 80);
  },
  hover: () => createTone(540, 35, 0.012, "sine"),
  click: () => createTone(620, 45, 0.02, "triangle"),
  modal: () => {
    createTone(700, 45, 0.02, "sine");
    setTimeout(() => createTone(910, 70, 0.013, "triangle"), 40);
  },
  success: () => {
    createTone(620, 60, 0.02, "sine");
    setTimeout(() => createTone(820, 80, 0.018, "triangle"), 70);
  },
};

export const UIExperienceProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("dokan-theme-mode") || "light");
  const [themePreset, setThemePresetState] = useState(() => localStorage.getItem("dokan-theme-preset") || "emerald");
  const [soundEnabled, setSoundEnabled] = useState(() => getStoredBoolean("dokan-sound-enabled", true));
  const [immersiveEnabled, setImmersiveEnabled] = useState(() => getStoredBoolean("dokan-immersive-enabled", true));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const unlockOnGesture = () => {
      unlockAudio();
    };
    window.addEventListener("pointerdown", unlockOnGesture, { passive: true });
    window.addEventListener("keydown", unlockOnGesture);
    window.addEventListener("touchstart", unlockOnGesture, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
      window.removeEventListener("touchstart", unlockOnGesture);
    };
  }, []);

  const toggleThemeMode = () => {
    setThemeMode((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem("dokan-theme-mode", next);
      return next;
    });
  };

  const setThemePreset = (preset) => {
    setThemePresetState(preset);
    localStorage.setItem("dokan-theme-preset", preset);
  };

  const setSound = async (enabled) => {
    const next = Boolean(enabled);
    setSoundEnabled(next);
    localStorage.setItem("dokan-sound-enabled", String(next));
    if (next) {
      const unlocked = await unlockAudio();
      if (unlocked) {
        SOUND_PRESETS.click();
      }
    }
  };

  const setImmersive = (enabled) => {
    setImmersiveEnabled(Boolean(enabled));
    localStorage.setItem("dokan-immersive-enabled", String(Boolean(enabled)));
  };

  const playSound = async (type) => {
    if (!soundEnabled) return;
    if (!audioUnlocked) {
      const unlocked = await unlockAudio();
      if (!unlocked) return;
    }
    const handler = SOUND_PRESETS[type];
    if (handler) handler();
  };

  const value = useMemo(
    () => ({
      themeMode,
      themePreset,
      setThemePreset,
      soundEnabled,
      immersiveEnabled,
      toggleThemeMode,
      setSound,
      setImmersive,
      playSound,
    }),
    [themeMode, themePreset, soundEnabled, immersiveEnabled]
  );

  return <UIExperienceContext.Provider value={value}>{children}</UIExperienceContext.Provider>;
};

export const useUIExperience = () => {
  const context = useContext(UIExperienceContext);
  if (!context) {
    throw new Error("useUIExperience must be used inside UIExperienceProvider");
  }
  return context;
};

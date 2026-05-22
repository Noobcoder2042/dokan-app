import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UIExperienceContext = createContext(null);

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
      soundEnabled,
      immersiveEnabled,
      toggleThemeMode,
      setSound,
      setImmersive,
      playSound,
    }),
    [themeMode, soundEnabled, immersiveEnabled]
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

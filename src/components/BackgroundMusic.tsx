
import { useCallback, useEffect, useRef, useState } from "react";

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.2;

    const savedTime = Number(
      sessionStorage.getItem("nasaMusicTime") || "0"
    );

    if (Number.isFinite(savedTime)) {
      audio.currentTime = savedTime;
    }

    const saveTime = () => {
      sessionStorage.setItem(
        "nasaMusicTime",
        String(audio.currentTime)
      );
    };

    const syncPlaying = () => setPlaying(!audio.paused);

    const removeUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlockMusic);
      window.removeEventListener("keydown", unlockMusic);
    };

    const tryAutoplay = () => {
      if (sessionStorage.getItem("nasaMusicOn") === "false") return;
      audio.play().then(removeUnlockListeners).catch(() => {});
    };

    // Browsers block autoplay until the user interacts with the page.
    // Start the music on the first interaction, unless that interaction is
    // the music button itself (its click handler takes care of toggling).
    function unlockMusic(event: Event) {
      const target = event.target as Element | null;
      if (target?.closest?.("[data-music-toggle]")) {
        removeUnlockListeners();
        return;
      }
      if (audio && !audio.paused) {
        removeUnlockListeners();
        return;
      }
      tryAutoplay();
    }

    audio.addEventListener("timeupdate", saveTime);
    audio.addEventListener("play", syncPlaying);
    audio.addEventListener("pause", syncPlaying);
    window.addEventListener("pagehide", saveTime);
    window.addEventListener("pointerdown", unlockMusic);
    window.addEventListener("keydown", unlockMusic);

    tryAutoplay();

    return () => {
      audio.removeEventListener("timeupdate", saveTime);
      audio.removeEventListener("play", syncPlaying);
      audio.removeEventListener("pause", syncPlaying);
      window.removeEventListener("pagehide", saveTime);
      removeUnlockListeners();
    };
  }, []);

  const setMusicEnabled = useCallback(async (enabled: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!enabled) {
      audio.pause();
      setPlaying(false);
      sessionStorage.setItem("nasaMusicOn", "false");
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
      sessionStorage.setItem("nasaMusicOn", "true");
    } catch {
      setPlaying(false);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio) void setMusicEnabled(audio.paused);
  }, [setMusicEnabled]);

  return { audioRef, playing, toggleMusic, setMusicEnabled };
}

export default function BackgroundMusic() {
  const { audioRef, playing, toggleMusic } = useBackgroundMusic();

  return (
    <>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/space-music.mp3`}
        loop
        preload="auto"
      />
      <button
        type="button"
        data-music-toggle
        onClick={toggleMusic}
        aria-label={playing ? "Pause background music" : "Play background music"}
        aria-pressed={playing}
        title={playing ? "Background music on" : "Background music off"}
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "11px 16px",
          border: "1px solid rgba(216, 189, 133, 0.8)",
          borderRadius: "999px",
          background: "rgba(20, 21, 46, 0.94)",
          color: "#f6dfa8",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: "13px",
        }}
      >
        <span aria-hidden="true">{playing ? "♫" : "♪"}</span>
        <span>{playing ? "Music On" : "Music Off"}</span>
      </button>
    </>
  );
}

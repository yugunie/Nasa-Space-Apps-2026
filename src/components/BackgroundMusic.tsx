
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

    const resumeMusic = () => {
      if (sessionStorage.getItem("nasaMusicOn") === "true") {
        audio.play()
          .then(() => setPlaying(true))
          .catch(() => {});
      }
    };

    audio.addEventListener("timeupdate", saveTime);
    window.addEventListener("pagehide", saveTime);
    window.addEventListener("pointerdown", resumeMusic, {
      once: true,
    });

    resumeMusic();

    return () => {
      audio.removeEventListener("timeupdate", saveTime);
      window.removeEventListener("pagehide", saveTime);
      window.removeEventListener("pointerdown", resumeMusic);
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
        src="/audio/space-music.mp3"
        loop
        preload="auto"
      />

      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: "110px",
          right: "25px",
          zIndex: 9999,
          background: "#14152e",
          color: "#f6dfa8",
          border: "1px solid #d8bd85",
          borderRadius: "30px",
          padding: "12px 18px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {playing ? "🔊 Music ON" : "🔇 Music OFF"}
      </button>
    </>
  );
}

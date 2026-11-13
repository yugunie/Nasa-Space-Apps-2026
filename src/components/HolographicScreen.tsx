import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Radio, Compass, Orbit, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { StorylineData } from '../types/story';
import { soundEngine } from '../audio/soundEngine';

interface HolographicScreenProps {
  storyline: StorylineData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HolographicScreen: React.FC<HolographicScreenProps> = ({
  storyline,
  isOpen,
  onClose,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        soundEngine.playHoloClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Stop audio on close
  useEffect(() => {
    if (!isOpen) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  const toggleSpeech = () => {
    if (!storyline) return;
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToRead = `${storyline.title}. ${storyline.subtitle}. ${storyline.summary}. ${storyline.fullNarrative.join(' ')}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  const handleClose = () => {
    soundEngine.playHoloClose();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && storyline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
          {/* Subtle dim backdrop with holographic grid scanlines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"
          />

          {/* Hologram Projector Beam Lines */}
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 0.4 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            <div
              className="w-full max-w-4xl h-full border border-dashed rounded-2xl"
              style={{ borderColor: storyline.accentColor }}
            />
          </motion.div>

          {/* Main Virtual Holographic HUD Card */}
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-slate-950/95 border text-slate-100 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6"
            style={{
              borderColor: storyline.accentColor,
              boxShadow: `0 0 50px -10px ${storyline.accentColor}40`,
            }}
          >
            {/* Top Hologram Header & Telemetry */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: storyline.accentColor }}
                  />
                  <span>Holographic Transmission</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-slate-400">{storyline.epoch}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono mt-1">
                  {storyline.title}
                </h2>
                <p className="text-sm text-slate-400">
                  {storyline.subtitle}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  title={isPlayingAudio ? "Stop Audio Transmission" : "Narrate Storyline"}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">Mute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-sky-400" />
                      <span className="hidden sm:inline">Narrate</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  title="Close Hologram (Esc)"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-red-500 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Astrophysical Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono">
              <div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>COORDINATES</span>
                </div>
                <div className="text-slate-200 mt-1 font-semibold truncate">
                  {storyline.telemetry.coordinates.split('|')[0].trim()}
                </div>
              </div>
              <div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  <span>STELLAR CLASS</span>
                </div>
                <div className="text-slate-200 mt-1 font-semibold truncate">
                  {storyline.telemetry.stellarClass.split('(')[0].trim()}
                </div>
              </div>
              <div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>TEMPERATURE</span>
                </div>
                <div className="text-slate-200 mt-1 font-semibold">
                  {storyline.telemetry.temperature}
                </div>
              </div>
              <div>
                <div className="text-slate-500 flex items-center gap-1">
                  <Orbit className="w-3.5 h-3.5" />
                  <span>DISTANCE</span>
                </div>
                <div className="text-slate-200 mt-1 font-semibold">
                  {storyline.telemetry.distanceLightYears}
                </div>
              </div>
            </div>

            {/* Archival Quote Callout */}
            <div className="relative pl-4 border-l-2 py-1 text-sm italic text-slate-300 font-serif bg-slate-900/40 rounded-r-lg" style={{ borderColor: storyline.accentColor }}>
              "{storyline.archivalQuote.text}"
              <span className="block not-italic text-xs text-slate-500 font-mono mt-1">
                — {storyline.archivalQuote.author}
              </span>
            </div>

            {/* Full Story Narrative Text */}
            <div className="flex flex-col gap-4 text-sm sm:text-base leading-relaxed text-slate-300 font-light font-sans">
              {storyline.fullNarrative.map((para, idx) => (
                <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-white first-letter:font-serif">
                  {para}
                </p>
              ))}
            </div>

            {/* Footer with telemetry phenomenon note */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">PRIMARY PHENOMENON:</span>
                <span className="text-slate-300">{storyline.telemetry.phenomenon}</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
              >
                Close Projection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

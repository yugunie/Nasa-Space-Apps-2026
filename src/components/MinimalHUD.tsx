import React, { useState } from 'react';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, BookOpen, Book as BookIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { soundEngine } from '../audio/soundEngine';

interface MinimalHUDProps {
  isOpen: boolean;
  currentSpreadIndex: number;
  onOpenBook: () => void;
  onCloseBook: () => void;
  onTurnPage: (dir: 'next' | 'prev') => void;
  onSelectChapter: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MinimalHUD: React.FC<MinimalHUDProps> = ({
  isOpen,
  currentSpreadIndex,
  onOpenBook,
  onCloseBook,
  onTurnPage,
  onSelectChapter,
  isMuted,
  onToggleMute,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const currentChapter = CHAPTERS[currentSpreadIndex];

  return (
    <div className="pointer-events-none fixed inset-0 select-none z-30 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Center: Minimal Cinematic Header (non-occluding) */}
      <header className="flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono tracking-widest text-slate-400 uppercase backdrop-blur-sm">
          <span>Stellar Cartography & Lore</span>
          <span className="text-slate-600">·</span>
          <span className="text-amber-300">Epoch 3.84</span>
        </div>
        <h1 className="text-lg sm:text-xl font-bold tracking-widest text-slate-100 font-serif mt-1 drop-shadow-md">
          ASTROCHRONICON
        </h1>
      </header>

      {/* Center Prompt when book is closed */}
      {!isOpen && (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-mono shadow-lg transition-transform hover:scale-105 cursor-pointer"
            onClick={() => {
              soundEngine.startAmbient();
              onOpenBook();
            }}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Click the Grimoire or Tap to Open</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 tracking-wider">
            Drag to orbit camera · Scroll to zoom
          </span>
        </div>
      )}

      {/* Bottom Center Unified Control Dock (Compliant with Three.js Skill Directives) */}
      <div className="flex flex-col items-center justify-end w-full">
        {/* Collapse / Expand Toggle Button */}
        <div className="pointer-events-auto mb-1.5">
          <button
            type="button"
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded-t-lg bg-slate-950/80 border-t border-x border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Dock Container */}
        {!isDockCollapsed && (
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 sm:p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-200 shadow-2xl max-w-2xl w-full">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              title={isMuted ? "Unmute Ambient Space Sound" : "Mute Sound"}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-slate-900 border-sky-500/40 text-sky-400 hover:bg-slate-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            {/* If Closed: Quick Open Action */}
            {!isOpen ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.startAmbient();
                  onOpenBook();
                }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs sm:text-sm font-mono font-medium transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open Book</span>
              </button>
            ) : (
              /* If Open: Page turning and chapter pills */
              <>
                {/* Prev Page */}
                <button
                  type="button"
                  onClick={() => onTurnPage('prev')}
                  disabled={currentSpreadIndex === 0}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs font-mono transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Chapter Select Pills */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {CHAPTERS.map((ch, idx) => {
                    const isActive = idx === currentSpreadIndex;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => onSelectChapter(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                          isActive
                            ? 'bg-sky-500/20 border border-sky-400 text-sky-300 font-bold shadow-sm'
                            : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Ch. {ch.romanNumeral}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  onClick={() => onTurnPage('next')}
                  disabled={currentSpreadIndex === CHAPTERS.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:hover:border-slate-800 text-xs font-mono transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Close Book Action */}
                <button
                  type="button"
                  onClick={onCloseBook}
                  title="Close 3D Book"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-200 text-xs font-mono transition-colors"
                >
                  <BookIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Close Book</span>
                </button>
              </>
            )}

            {/* Current Chapter Label Info */}
            {isOpen && (
              <div className="hidden lg:flex items-center gap-2 pl-2 text-xs font-mono text-slate-400 border-l border-slate-800">
                <span className="text-slate-500">Pages {currentSpreadIndex * 2 + 1}-{currentSpreadIndex * 2 + 2}:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[140px]">
                  {currentChapter.title}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

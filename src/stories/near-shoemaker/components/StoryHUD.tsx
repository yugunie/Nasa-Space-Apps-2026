import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { STORY_PAGES, type StoryPage } from '../story/storyData';

export interface StoryHUDProps {
  pageIndex: number;
  currentPage: StoryPage;
  soundEnabled: boolean;
  readAloudEnabled: boolean;
  dockCollapsed: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectPage: (idx: number) => void;
  onTriggerAction: () => void;
  onToggleSound: () => void;
  onToggleReadAloud: () => void;
  onResetView: () => void;
  onToggleDock: () => void;
}

export function StoryHUD({
  pageIndex,
  currentPage,
  soundEnabled,
  readAloudEnabled,
  dockCollapsed,
  onPrev,
  onNext,
  onSelectPage,
  onTriggerAction,
  onToggleSound,
  onToggleReadAloud,
  onResetView,
  onToggleDock,
}: StoryHUDProps) {
  const isCover = pageIndex === 0;
  const isLast = pageIndex === STORY_PAGES.length - 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
      {/* Top Bar: Clean 3-zone header, high contrast, unboxed metadata */}
      <header className="pointer-events-auto flex items-center justify-between gap-4 sm:gap-8 rounded-xl bg-[#070914]/92 border border-[#D5AC55]/25 px-4 py-2.5 shadow-lg">
        <a
          href="/index.html"
          className="shrink-0 rounded-lg border border-[#D5AC55]/40 bg-white/10 px-2.5 py-2 text-xs sm:text-sm font-bold text-[#E8C574] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[#E8C574]"
          aria-label="Return to Echoes Beyond Earth library"
        >
          ← Library
        </a>
        <div className="flex items-center gap-2.5 shrink-0">
          <BookOpen className="w-5 h-5 text-[#E8C574] shrink-0" aria-hidden="true" />
          <span className="font-story text-base sm:text-lg font-bold tracking-tight text-[#F3EDE0] whitespace-nowrap shrink-0">
            NEAR Shoemaker
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-slate-200 whitespace-nowrap truncate">
          <span className="font-num text-[#E8C574] font-semibold">
            {isCover ? 'Cover' : `${String(pageIndex).padStart(2, '0')} / ${STORY_PAGES.length - 1}`}
          </span>
          <span aria-hidden="true" className="text-slate-500">
            ·
          </span>
          <span className="font-story font-semibold text-[#F3EDE0]">
            {currentPage.chapterTitle}
          </span>
          <span aria-hidden="true" className="text-slate-500">
            ·
          </span>
          <span className="text-slate-300 text-xs">{currentPage.pageSpreadHint}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleReadAloud}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer ${
              readAloudEnabled
                ? 'bg-[#E8C574] text-[#050710] hover:bg-[#f1d592]'
                : 'bg-white/10 text-[#F3EDE0] hover:bg-white/18'
            }`}
            aria-pressed={readAloudEnabled}
            title="Toggle Read-Aloud Narration"
          >
            {readAloudEnabled ? 'Read Aloud: On' : 'Read Aloud'}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/10 text-[#F3EDE0] hover:bg-white/18 transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={soundEnabled ? 'Sound Effects On' : 'Sound Effects Off'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onResetView}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-white/10 text-[#F3EDE0] hover:bg-white/18 transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
            aria-label="Reset camera view"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bottom Collapsible Control Dock (unobstructed center 3D viewport) */}
      <div className="flex flex-col items-center w-full">
        <button
          type="button"
          onClick={onToggleDock}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#070914]/92 border border-b-0 border-[#D5AC55]/25 text-xs font-semibold text-slate-200 hover:text-[#F3EDE0] hover:bg-[#0e1226] transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
        >
          {dockCollapsed ? (
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

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full max-w-[820px] rounded-2xl bg-[#070914]/95 border border-[#D5AC55]/25 px-4 py-3 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left: Previous / Cover */}
              <button
                type="button"
                onClick={onPrev}
                disabled={isCover}
                className={`min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-story text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E8C574] ${
                  isCover
                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-white/10 text-[#F3EDE0] hover:bg-white/18 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>{pageIndex === 1 ? 'Cover' : 'Previous'}</span>
              </button>

              {/* Center: Interactive 3D Scene Action */}
              {!isCover && (
                <button
                  type="button"
                  onClick={onTriggerAction}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111830] border border-[#D5AC55]/40 text-[#E8C574] hover:bg-[#192244] hover:text-[#F3EDE0] font-story text-sm sm:text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{currentPage.actionLabel}</span>
                </button>
              )}

              {/* Right: Open Book / Next Page */}
              <button
                type="button"
                onClick={isLast ? () => onSelectPage(0) : onNext}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#E8C574] text-[#050710] hover:bg-[#f1d592] font-story text-sm sm:text-base font-bold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
              >
                <span>
                  {isCover ? 'Open Book' : isLast ? 'Back to Cover' : 'Next Page'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Chapter Progress Bar */}
            <div
              className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto"
              role="navigation"
              aria-label="Story pages"
            >
              {STORY_PAGES.map((p) => {
                const active = p.index === pageIndex;
                return (
                  <button
                    key={p.sceneId}
                    type="button"
                    onClick={() => onSelectPage(p.index)}
                    title={p.chapterTitle}
                    aria-label={`Go to ${p.chapterTitle}`}
                    aria-current={active ? 'page' : undefined}
                    className={`flex-1 min-w-[30px] h-7 rounded-md font-num text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer ${
                      active
                        ? 'bg-[#E8C574] text-[#050710]'
                        : p.index < pageIndex
                          ? 'bg-[#D5AC55]/25 text-[#F3EDE0] hover:bg-[#D5AC55]/40'
                          : 'bg-white/8 text-slate-300 hover:bg-white/16'
                    }`}
                  >
                    {p.index === 0 ? '★' : p.index}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

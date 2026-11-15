import { useEffect, useState } from 'react';
import {
  AudioLines,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RotateCcw,
  Slash,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { STORY_PAGES, type StoryPage } from '../story/storyData';

const EXIT_ANIMATION_DURATION_MS = 300;

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
  const [isLeaving, setIsLeaving] = useState(false);
  const [pageNumberInput, setPageNumberInput] = useState(String(pageIndex));
  const [topBarCollapsed, setTopBarCollapsed] = useState(false);
  const isCover = pageIndex === 0;
  const isLast = pageIndex === STORY_PAGES.length - 1;

  useEffect(() => {
    setPageNumberInput(String(pageIndex));
  }, [pageIndex]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 transition-[padding-top,padding-bottom] duration-300 ease-in-out motion-reduce:transition-none"
      style={{
        paddingTop: topBarCollapsed ? 0 : undefined,
        paddingBottom: dockCollapsed ? 0 : undefined,
      }}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-50 bg-[#070914] transition-opacity duration-300 motion-reduce:transition-none ${
          isLeaving ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="pointer-events-auto flex w-full flex-col">
        <div
          id="story-top-bar"
          aria-hidden={topBarCollapsed}
          inert={topBarCollapsed}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-in-out motion-reduce:transition-none ${
            topBarCollapsed
              ? 'grid-rows-[0fr] -translate-y-2 opacity-0'
              : 'grid-rows-[1fr] translate-y-0 opacity-100'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            {/* Top Bar: Clean 3-zone header, high contrast, unboxed metadata */}
            <header className="pointer-events-auto flex flex-wrap items-center justify-between gap-2 sm:gap-8 rounded-xl bg-[#070914]/92 border border-[#D5AC55]/25 px-4 py-2.5 shadow-lg">
        <a
          href="/index.html"
          onClick={(event) => {
            if (
              event.button !== 0 ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey
            ) {
              return;
            }

            event.preventDefault();
            if (isLeaving) return;

            setIsLeaving(true);
            const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 0
              : EXIT_ANIMATION_DURATION_MS;
            window.setTimeout(() => window.location.assign('/index.html'), delay);
          }}
          className="shrink-0 rounded-lg border border-[#D5AC55]/40 bg-white/10 px-2.5 py-2 text-xs sm:text-sm font-bold text-[#E8C574] hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-[#E8C574]"
          aria-label="Return to Echoes Beyond Earth library"
        >
          ← Library
        </a>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-x-2 gap-y-1">
          <BookOpen className="w-5 h-5 text-[#E8C574] shrink-0" aria-hidden="true" />
          <span className="font-story text-base sm:text-lg font-bold tracking-tight text-[#F3EDE0] whitespace-nowrap shrink-0">
            NEAR Shoemaker
          </span>
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1 text-sm text-slate-200">
            <span className="font-story font-semibold text-[#F3EDE0]">
              {currentPage.chapterTitle}
            </span>
            <span aria-hidden="true" className="text-slate-500">
              ·
            </span>
            <span className="text-slate-300 text-xs">{currentPage.pageSpreadHint}</span>
          </div>
        </div>

            </header>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTopBarCollapsed((collapsed) => !collapsed)}
          aria-expanded={!topBarCollapsed}
          aria-controls="story-top-bar"
          className="pointer-events-auto relative z-10 -mt-px self-end inline-flex items-center gap-1.5 rounded-b-lg border border-t-0 border-[#D5AC55]/25 bg-[#070914]/92 px-3 py-1 text-xs font-semibold text-slate-200 transition-colors hover:text-[#F3EDE0] hover:bg-[#0e1226] focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
        >
          {topBarCollapsed ? (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Show Details</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hide Details</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Collapsible Control Dock (unobstructed center 3D viewport) */}
      <div className="flex flex-col items-center w-full">
        <button
          type="button"
          onClick={onToggleDock}
          className={`pointer-events-auto relative z-10 mb-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#070914]/92 border border-[#D5AC55]/25 text-xs font-semibold text-slate-200 hover:text-[#F3EDE0] hover:bg-[#0e1226] transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer ${
            dockCollapsed ? 'border-b rounded-b-none' : 'border-b-0'
          }`}
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Page Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Page Controls</span>
            </>
          )}
        </button>

        <div
          aria-hidden={dockCollapsed}
          inert={dockCollapsed}
          className={`grid w-full max-w-[1200px] overflow-hidden transition-[grid-template-rows,opacity,transform] duration-300 ease-in-out motion-reduce:transition-none ${
            dockCollapsed
              ? 'grid-rows-[0fr] -translate-y-2 opacity-0'
              : 'pointer-events-auto grid-rows-[1fr] translate-y-0 opacity-100'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="w-full rounded-2xl bg-[#070914]/95 border border-[#D5AC55]/25 px-2 py-3 sm:px-4 shadow-2xl">
              <div className="grid w-full grid-cols-[minmax(112px,1fr)_minmax(90px,1fr)_auto] items-center gap-0 sm:grid-cols-[minmax(120px,1fr)_minmax(128px,1fr)_auto] sm:gap-1 xl:grid-cols-[minmax(520px,1fr)_minmax(128px,1fr)_auto]">
                <div className="flex w-full min-w-0 items-center gap-0 sm:gap-1">
                  {/* Left: Previous / Cover */}
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={isCover}
                    className={`min-h-[44px] min-w-[40px] flex flex-1 items-center justify-center gap-1 px-1 xl:min-w-[128px] xl:px-4 py-2 rounded-xl font-story text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E8C574] ${
                      isCover
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                        : 'bg-white/10 text-[#F3EDE0] hover:bg-white/18 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only xl:not-sr-only">{pageIndex === 1 ? 'Cover' : 'Previous'}</span>
                  </button>

                  {/* Center: Interactive 3D Scene Action */}
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={onTriggerAction}
                      className="min-h-[44px] min-w-[32px] flex flex-1 items-center justify-center gap-1 px-1 xl:min-w-[208px] xl:px-4 py-2 rounded-xl bg-[#111830] border border-[#D5AC55]/40 text-[#E8C574] hover:bg-[#192244] hover:text-[#F3EDE0] font-story text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="sr-only xl:not-sr-only">{currentPage.actionLabel}</span>
                    </button>
                  ) : (
                    <span aria-hidden="true" className="h-[44px] min-w-[32px] flex-1 xl:min-w-[208px]" />
                  )}

                  {/* Right: Open Book / Next Page */}
                  <button
                    type="button"
                    onClick={isLast ? () => onSelectPage(0) : onNext}
                    className="min-h-[44px] min-w-[40px] flex flex-1 items-center justify-center gap-1 px-1 xl:min-w-[176px] xl:px-5 py-2 rounded-xl bg-[#E8C574] text-[#050710] hover:bg-[#f1d592] font-story text-sm sm:text-base font-bold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
                  >
                    <span className="sr-only xl:not-sr-only">
                      {isCover ? 'Open Book' : isLast ? 'Back to Cover' : 'Next Page'}
                    </span>
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <div className="flex w-full min-w-0 items-center justify-center gap-0 sm:gap-1">
                  <button
                    type="button"
                    onClick={onToggleReadAloud}
                    className={`min-h-[40px] min-w-[30px] flex flex-1 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer sm:min-w-[40px] ${
                      readAloudEnabled
                        ? 'bg-[#E8C574] text-[#050710] hover:bg-[#f1d592]'
                        : 'bg-white/10 text-[#F3EDE0] hover:bg-white/18'
                    }`}
                    aria-pressed={readAloudEnabled}
                    aria-label={readAloudEnabled ? 'Turn read-aloud off' : 'Turn read-aloud on'}
                    title={readAloudEnabled ? 'Read-aloud narration on' : 'Read-aloud narration off'}
                  >
                    <span className="relative flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
                      <AudioLines className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      {!readAloudEnabled && (
                        <Slash className="absolute inset-0 h-4 w-4 text-red-500 stroke-[3] sm:h-5 sm:w-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`min-h-[40px] min-w-[30px] flex flex-1 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer sm:min-w-[40px] ${
                      soundEnabled
                        ? 'bg-[#E8C574] text-[#050710] hover:bg-[#f1d592]'
                        : 'bg-white/10 text-[#F3EDE0] hover:bg-white/18'
                    }`}
                    aria-label={soundEnabled ? 'Mute sound and music' : 'Unmute sound and music'}
                    title={soundEnabled ? 'Sound Effects and Music On' : 'Sound Effects and Music Off'}
                  >
                    <span className="relative flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                      {!soundEnabled && (
                        <Slash className="absolute inset-0 h-4 w-4 text-red-500 stroke-[3] sm:h-5 sm:w-5" aria-hidden="true" />
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={onResetView}
                    className="min-h-[40px] min-w-[30px] flex flex-1 items-center justify-center rounded-lg bg-white/10 text-[#F3EDE0] hover:bg-white/18 transition-colors focus-visible:outline-2 focus-visible:outline-[#E8C574] cursor-pointer sm:min-w-[40px]"
                    aria-label="Reset camera view"
                    title="Reset Camera View"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                {/* Chapter Progress Slider */}
                <div className="flex min-w-0 items-center justify-end gap-2 xl:gap-3">
                  <span className="sr-only shrink-0 font-num text-xs font-semibold text-[#E8C574] xl:not-sr-only xl:w-16 xl:text-center" aria-live="polite">
                    {isCover ? 'Cover' : `${pageIndex} / ${STORY_PAGES.length - 1}`}
                  </span>
                  <label className="sr-only" htmlFor="story-page-slider">
                    Story page
                  </label>
                  <input
                    id="story-page-slider"
                    type="range"
                    min={0}
                    max={STORY_PAGES.length - 1}
                    step={1}
                    value={pageIndex}
                    onChange={(event) => onSelectPage(Number(event.currentTarget.value))}
                    aria-valuetext={isCover ? 'Cover' : `Page ${pageIndex} of ${STORY_PAGES.length - 1}`}
                    className="h-2 w-[25vw] min-w-6 max-w-[25vw] cursor-pointer accent-[#E8C574] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E8C574]"
                  />
                  <label className="sr-only" htmlFor="story-page-number">
                    Enter a page number, from 0 for the cover to {STORY_PAGES.length - 1}
                  </label>
                  <input
                    id="story-page-number"
                    type="number"
                    min={0}
                    max={STORY_PAGES.length - 1}
                    step={1}
                    value={pageNumberInput}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setPageNumberInput(value);
                      const page = Number(value);
                      if (
                        value !== '' &&
                        Number.isInteger(page) &&
                        page >= 0 &&
                        page < STORY_PAGES.length
                      ) {
                        onSelectPage(page);
                      }
                    }}
                    onBlur={() => {
                      if (pageNumberInput === '') {
                        setPageNumberInput(String(pageIndex));
                        return;
                      }

                      const page = Math.min(
                        STORY_PAGES.length - 1,
                        Math.max(0, Math.round(Number(pageNumberInput))),
                      );
                      setPageNumberInput(String(page));
                      onSelectPage(page);
                    }}
                    className="w-10 shrink-0 rounded-md border border-[#D5AC55]/35 bg-white/10 px-1 py-1 text-center font-num text-sm text-[#F3EDE0] focus-visible:outline-2 focus-visible:outline-[#E8C574] sm:w-16 sm:px-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

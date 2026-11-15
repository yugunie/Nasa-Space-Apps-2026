import { useCallback, useEffect, useState } from 'react';
import { soundEngine } from './audio/soundEngine';
import { StoryHUD } from './components/StoryHUD';
import { STORY_PAGES } from './story/storyData';
import { SpaceBookStage } from './three/SpaceBookStage';

export default function App() {
  const [pageIndex, setPageIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readAloudEnabled, setReadAloudEnabled] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [actionPulseId, setActionPulseId] = useState(0);
  const [resetViewId, setResetViewId] = useState(0);

  const currentPage = STORY_PAGES[pageIndex] ?? STORY_PAGES[0];

  const goToPage = useCallback((nextIdx: number) => {
    const clamped = Math.max(0, Math.min(STORY_PAGES.length - 1, nextIdx));
    setPageIndex((prev) => {
      if (prev === clamped) return prev;
      soundEngine.playPageFlip();
      const targetPage = STORY_PAGES[clamped];
      if (targetPage) {
        window.setTimeout(() => {
          soundEngine.playCue(targetPage.soundCue);
          soundEngine.speak(targetPage.narration);
        }, 240);
      }
      return clamped;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (pageIndex < STORY_PAGES.length - 1) {
      goToPage(pageIndex + 1);
    }
  }, [pageIndex, goToPage]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) {
      goToPage(pageIndex - 1);
    }
  }, [pageIndex, goToPage]);

  const handleOpenBook = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const handleCloseBook = useCallback(() => {
    goToPage(0);
  }, [goToPage]);

  const handleTriggerAction = useCallback(() => {
    setActionPulseId((n) => n + 1);
    soundEngine.playInteractionPop();
    soundEngine.playCue(currentPage.soundCue);
  }, [currentPage.soundCue]);

  const handleInteractScene = useCallback(() => {
    setActionPulseId((n) => n + 1);
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEngine.soundEnabled = next;
      return next;
    });
  }, []);

  const handleToggleReadAloud = useCallback(() => {
    setReadAloudEnabled((prev) => {
      const next = !prev;
      soundEngine.readAloudEnabled = next;
      if (next) {
        soundEngine.speak(currentPage.narration);
      } else {
        soundEngine.stopSpeech();
      }
      return next;
    });
  }, [currentPage.narration]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  useEffect(() => {
    return () => {
      soundEngine.stopSpeech();
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0c0509]">
      <SpaceBookStage
        pageIndex={pageIndex}
        actionPulseId={actionPulseId}
        resetViewId={resetViewId}
        onOpenBook={handleOpenBook}
        onCloseBook={handleCloseBook}
        onPrevPage={handlePrev}
        onNextPage={handleNext}
        onInteractScene={handleInteractScene}
      />

      <StoryHUD
        pageIndex={pageIndex}
        currentPage={currentPage}
        soundEnabled={soundEnabled}
        readAloudEnabled={readAloudEnabled}
        dockCollapsed={dockCollapsed}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelectPage={goToPage}
        onTriggerAction={handleTriggerAction}
        onToggleSound={handleToggleSound}
        onToggleReadAloud={handleToggleReadAloud}
        onResetView={() => setResetViewId((n) => n + 1)}
        onToggleDock={() => setDockCollapsed((c) => !c)}
      />
    </main>
  );
}

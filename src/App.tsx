/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SpaceScene } from './three/SpaceScene';
import { CHAPTERS } from './data/chapters';
import { StorylineData } from './types/story';
import { HolographicScreen } from './components/HolographicScreen';
import { MinimalHUD } from './components/MinimalHUD';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SpaceScene | null>(null);

  const [isBookOpen, setIsBookOpen] = useState<boolean>(false);
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [activeStoryline, setActiveStoryline] = useState<StorylineData | null>(null);
  const [isHoloOpen, setIsHoloOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize 3D SpaceScene once
    const scene = new SpaceScene(mountRef.current);
    sceneRef.current = scene;

    // Storyline click from 3D raycaster
    scene.onOpenStoryline = (chapterIndex: number) => {
      const chapter = CHAPTERS[chapterIndex];
      if (chapter) {
        setActiveStoryline(chapter.storyline);
        setIsHoloOpen(true);
      }
    };

    // Book state callbacks
    scene.book.onBookStateChange = (open: boolean) => {
      setIsBookOpen(open);
    };

    scene.book.onSpreadChange = (spreadIdx: number) => {
      setCurrentSpreadIndex(spreadIdx);
    };

    // Keyboard shortcut listeners for reading navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scene.book.isOpen) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        scene.book.turnPage('next');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        scene.book.turnPage('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleOpenBook = () => {
    if (sceneRef.current) {
      sceneRef.current.book.openBook();
    }
  };

  const handleCloseBook = () => {
    if (sceneRef.current) {
      sceneRef.current.book.closeBook();
    }
  };

  const handleTurnPage = (dir: 'next' | 'prev') => {
    if (sceneRef.current) {
      sceneRef.current.book.turnPage(dir);
    }
  };

  const handleSelectChapter = (index: number) => {
    if (sceneRef.current) {
      sceneRef.current.book.goToSpread(index);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Space HUD Overlay */}
      <MinimalHUD
        isOpen={isBookOpen}
        currentSpreadIndex={currentSpreadIndex}
        onOpenBook={handleOpenBook}
        onCloseBook={handleCloseBook}
        onTurnPage={handleTurnPage}
        onSelectChapter={handleSelectChapter}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Virtual Holographic Screen Popup */}
      <HolographicScreen
        storyline={activeStoryline}
        isOpen={isHoloOpen}
        onClose={() => setIsHoloOpen(false)}
      />
    </div>
  );
}

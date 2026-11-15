export type StorySceneId =
  | 'cover'
  | 'meet-surveyor'
  | 'mission'
  | 'moon-work'
  | 'signal-quiet'
  | 'apollo-arrives'
  | 'visitors'
  | 'legacy'
  | 'meet-near'
  | 'blast-off'
  | 'mathilde'
  | 'passed-stop'
  | 'lost-connection'
  | 'back-on-track'
  | 'orbiting-eros'
  | 'unexpected-landing'
  | 'nothing-impossible'
  | 'grandpa-eros'
  | 'never-forgotten'
  | 'cosmic-hug';

export interface PopupLine {
  text: string;
  color?: string;
  scale?: number;
}

export interface StoryPage {
  index: number;
  sceneId: StorySceneId;
  chapterTitle: string;
  /** Short, crisp lines rendered upright at 90 degrees on the open book with zero box background */
  popupLines: PopupLine[];
  /** Full spoken narration for Read-Aloud mode */
  narration: string;
  /** Interactive action button label */
  actionLabel: string;
  /** Subtle page footer cue on the flat paper spread */
  pageSpreadHint: string;
  /** Sound cue when flipping to this page */
  soundCue: 'open' | 'happy' | 'boost' | 'camera' | 'uhoh' | 'sad' | 'fanfare' | 'gentle';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'Surveyor 3', color: '#FFE066', scale: 1.25 },
      { text: 'The Little Robot Who Waited for Visitors', color: '#FFFFFF', scale: 0.9 },
    ],
    narration:
      'Welcome to Surveyor 3 — The Little Robot Who Waited for Visitors! Click Open Book to start the adventure.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-surveyor',
    chapterTitle: 'A Moon Adventure',
    popupLines: [
      { text: 'Hello, everyone! Meet Surveyor 3!', color: '#FFE066', scale: 1.05 },
      { text: 'A little robot sent to the Moon!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "Hello, everyone! Today, we're going on a very special adventure to the Moon! And guess what? We're going to meet a little robot named Surveyor 3!",
    actionLabel: 'Wave to Surveyor 3',
    pageSpreadHint: 'Tap Surveyor 3 to say hello',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'mission',
    chapterTitle: 'A Very Important Mission',
    popupLines: [
      { text: 'Surveyor 3 went to the Moon in 1967.', color: '#7CE8FF', scale: 1.02 },
      { text: 'Could astronauts land there safely?', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      'Surveyor 3 was sent all the way to the Moon in 1967. But why, you ask? Well, our scientist friends wanted to know what the Moon was like! Was its ground soft? Was it hard? Could astronauts safely land there? And so, Surveyor 3 was given a very important mission.',
    actionLabel: 'Trace the Route',
    pageSpreadHint: 'Tap the Moon or Surveyor 3 to trace the path',
    soundCue: 'boost',
  },
  {
    index: 3,
    sceneId: 'moon-work',
    chapterTitle: 'Surveyor Gets to Work',
    popupLines: [
      { text: 'It landed safely on the Moon!', color: '#FFE066', scale: 1.04 },
      { text: 'Pictures, soil studies and little holes!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "After travelling all that way, our little friend finally landed on the Moon! It began taking pictures, studying the lunar soil and even digging little holes with its special mechanical arm.",
    actionLabel: 'Dig a Little',
    pageSpreadHint: 'Tap Surveyor 3 to test its mechanical arm',
    soundCue: 'camera',
  },
  {
    index: 4,
    sceneId: 'signal-quiet',
    chapterTitle: 'A Quiet Moon',
    popupLines: [
      { text: 'Days passed... then months passed...', color: '#7CE8FF', scale: 1.0 },
      { text: 'Surveyor 3 stopped sending signals.', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      'Days passed... Surveyor 3 continued its work. Then, months passed... But something happened. Its mission eventually came to an end, and our little robot stopped sending signals.',
    actionLabel: 'Look Toward Earth',
    pageSpreadHint: 'Tap Surveyor 3 as it looks back at Earth',
    soundCue: 'sad',
  },
  {
    index: 5,
    sceneId: 'apollo-arrives',
    chapterTitle: 'Visitors From Apollo 12',
    popupLines: [
      { text: 'Two years passed... November 1969!', color: '#FFE066', scale: 1.0 },
      { text: 'Apollo 12 landed nearby!', color: '#FFFFFF', scale: 1.02 },
    ],
    narration:
      "But wait! Was that really the end of its story? Two years passed... And then, in November 1969, something extraordinary happened! Two astronauts from Apollo 12 landed nearby!",
    actionLabel: 'Land Apollo 12',
    pageSpreadHint: 'Tap the lunar module to land nearby',
    soundCue: 'fanfare',
  },
  {
    index: 6,
    sceneId: 'visitors',
    chapterTitle: 'A Visit at Last',
    popupLines: [
      { text: 'The astronauts walked over to Surveyor 3!', color: '#7CE8FF', scale: 0.98 },
      { text: 'They studied it and brought parts home.', color: '#FFE066', scale: 0.98 },
    ],
    narration:
      'Can you guess what they did next? They walked over to Surveyor 3 and our little friend finally had visitors! The astronauts took pictures, examined the spacecraft and even brought some of its parts back to Earth so scientists could study what two years on the Moon had done to it.',
    actionLabel: 'Explore Together',
    pageSpreadHint: 'Tap the astronauts to examine Surveyor 3',
    soundCue: 'camera',
  },
  {
    index: 7,
    sceneId: 'legacy',
    chapterTitle: 'The End—and a Lesson',
    popupLines: [
      { text: 'Surveyor 3 helped prepare humans for the Moon.', color: '#FFFFFF', scale: 0.96 },
      { text: 'What you give can keep making a difference!', color: '#FFE066', scale: 0.96 },
    ],
    narration:
      'Surveyor 3 had stopped working, but its discoveries had helped humans prepare for their own journey to the Moon. And even after its mission ended, it still had something important to teach us! You see, even when you think your job is finished, the things you’ve learned and the help you’ve given can continue to make a difference! The end.',
    actionLabel: 'Say Thank You',
    pageSpreadHint: 'Tap to send Surveyor 3 a thank-you star',
    soundCue: 'gentle',
  },
];

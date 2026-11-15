export type StorySceneId =
  | 'cover'
  | 'meet-ingenuity'
  | 'brave-helicopter'
  | 'impossible-mars'
  | 'weather-mission'
  | 'jezero-landing'
  | 'exploring-mars'
  | 'one-month'
  | 'three-years'
  | 'better-robot'
  | 'believe-in-yourself';

export interface PopupLine {
  text: string;
  color?: string;
  scale?: number;
}

export interface StoryPage {
  index: number;
  sceneId: StorySceneId;
  chapterTitle: string;
  popupLines: PopupLine[];
  narration: string;
  actionLabel: string;
  pageSpreadHint: string;
  soundCue: 'open' | 'happy' | 'rotor' | 'wind' | 'signal' | 'uhoh' | 'fanfare' | 'gentle';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'Ingenuity Helicopter', color: '#FFE066', scale: 1.2 },
      { text: 'Narrated by Lily', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Welcome to Ingenuity Helicopter, a Mars space story narrated by Lily! Tap Open Book to start our adventure.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the dark red book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-ingenuity',
    chapterTitle: 'Meet Ingenuity',
    popupLines: [
      { text: 'Today we are visiting Mars', color: '#FF9E80', scale: 1.02 },
      { text: 'with our great friend Ingenuity helicopter!', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      "Hi, I'm Lily! Today, we will be visiting Mars with our great friend Ingenuity helicopter!",
    actionLabel: 'Spin Rotors',
    pageSpreadHint: 'Tap Ingenuity or Lily to say hello',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'brave-helicopter',
    chapterTitle: 'Brave in Mars Winds',
    popupLines: [
      { text: 'It is a small helicopter,', color: '#FFE066', scale: 1.02 },
      { text: 'meant to take the daring winds of Mars!', color: '#FFFFFF', scale: 0.95 },
    ],
    narration:
      'It is a small helicopter, meant to take the daring winds of Mars. Look how brave Ingenuity is!',
    actionLabel: 'Gust of Wind',
    pageSpreadHint: 'Tap Ingenuity to brave the Martian wind',
    soundCue: 'wind',
  },
  {
    index: 3,
    sceneId: 'impossible-mars',
    chapterTitle: 'Only One Month?',
    popupLines: [
      { text: 'Mars is different from Earth—almost impossible to fly!', color: '#FF9E80', scale: 0.93 },
      { text: 'Scientists thought it could only visit for a month.', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Mars is different from Earth. It is almost impossible to fly there! So, our scientist friends only built it thinking it could only visit Mars for a month.',
    actionLabel: 'Test Flight',
    pageSpreadHint: 'Tap to compare Earth and Mars',
    soundCue: 'rotor',
  },
  {
    index: 4,
    sceneId: 'weather-mission',
    chapterTitle: 'Mars Weather Report',
    popupLines: [
      { text: 'All Ingenuity had to do was tell scientists', color: '#7CE8FF', scale: 0.95 },
      { text: 'how the weather was like on Mars!', color: '#FFFFFF', scale: 0.98 },
    ],
    narration:
      "Ingenuity helicopter didn't have to do anything big. All it had to do was tell our scientist friends how the weather was like there!",
    actionLabel: 'Send Weather',
    pageSpreadHint: 'Tap Ingenuity to beam a Mars weather report',
    soundCue: 'signal',
  },
  {
    index: 5,
    sceneId: 'jezero-landing',
    chapterTitle: 'Jezero Crater',
    popupLines: [
      { text: 'And so, Ingenuity helicopter landed', color: '#FFE066', scale: 1.0 },
      { text: 'into Jezero Crater on Mars!', color: '#FF9E80', scale: 1.04 },
    ],
    narration:
      'And so, Ingenuity helicopter landed into the Jezero crater on Mars!',
    actionLabel: 'Touch Down',
    pageSpreadHint: 'Tap Ingenuity to hop gently in Jezero Crater',
    soundCue: 'rotor',
  },
  {
    index: 6,
    sceneId: 'exploring-mars',
    chapterTitle: 'One Fateful Day...',
    popupLines: [
      { text: 'Ingenuity sent signals constantly...', color: '#80FFDB', scale: 0.98 },
      { text: 'until one fateful day came!', color: '#FFE066', scale: 1.05 },
    ],
    narration:
      'Ingenuity helicopter fulfilled its mission, sending scientists signals constantly until one fateful day came...',
    actionLabel: 'Explore Ridge',
    pageSpreadHint: 'Tap Ingenuity to soar over the red canyon',
    soundCue: 'signal',
  },
  {
    index: 7,
    sceneId: 'one-month',
    chapterTitle: 'A Month Passed...',
    popupLines: [
      { text: 'A month passed—still sending signals!', color: '#FFE066', scale: 1.0 },
      { text: 'Scientists were not celebrating yet...', color: '#FFFFFF', scale: 0.95 },
    ],
    narration:
      'A month passed... Ingenuity was still sending signals! However, scientists were not celebrating yet...',
    actionLabel: 'Ping Earth',
    pageSpreadHint: 'Tap Ingenuity to keep flying past month one',
    soundCue: 'uhoh',
  },
  {
    index: 8,
    sceneId: 'three-years',
    chapterTitle: 'Three Years Alive!',
    popupLines: [
      { text: '2 months... A year... THREE YEARS passed!', color: '#FFE066', scale: 0.98 },
      { text: 'Ingenuity helicopter was STILL alive!', color: '#80FFDB', scale: 1.04 },
    ],
    narration:
      '2 months passed... A year passed... Three years passed... Ingenuity helicopter was still alive! Our scientist friends were totally shocked!',
    actionLabel: 'Cheer & Spin',
    pageSpreadHint: 'Tap to celebrate 3 amazing years on Mars',
    soundCue: 'fanfare',
  },
  {
    index: 9,
    sceneId: 'better-robot',
    chapterTitle: 'A Better Robot',
    popupLines: [
      { text: 'Ingenuity taught our scientist friends', color: '#7CE8FF', scale: 0.98 },
      { text: 'how to make a better robot helicopter!', color: '#FFE066', scale: 1.0 },
    ],
    narration:
      'Ingenuity helicopter continued to help our scientist friends by telling them how to make a better robot helicopter!',
    actionLabel: 'Build Chopper',
    pageSpreadHint: 'Tap the scientists to build the new robot helicopter',
    soundCue: 'happy',
  },
  {
    index: 10,
    sceneId: 'believe-in-yourself',
    chapterTitle: 'Believe In Yourself',
    popupLines: [
      { text: 'As long as you believe in yourself, it is possible!', color: '#FFE066', scale: 0.95 },
      { text: 'The End · Love, Lily & Ingenuity', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      'Even if everyone believes you cannot do it, as long as you believe in yourself, it is possible! The end!',
    actionLabel: 'Wave with Lily',
    pageSpreadHint: 'Tap Lily or Ingenuity on Mars to wave',
    soundCue: 'fanfare',
  },
];

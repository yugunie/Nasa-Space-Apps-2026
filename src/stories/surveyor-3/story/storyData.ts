export type StorySceneId =
  | 'cover'
  | 'meet-surveyor'
  | 'why-1967'
  | 'journey-to-moon'
  | 'digging-soil'
  | 'mission-ends'
  | 'apollo12-landing'
  | 'visitors-arrive'
  | 'examining-surveyor'
  | 'helping-humans'
  | 'make-a-difference';

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
  soundCue:
    | 'open'
    | 'happy'
    | 'launch'
    | 'dig'
    | 'signal'
    | 'sleep'
    | 'landing'
    | 'camera'
    | 'fanfare';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'Surveyor 3', color: '#FFE066', scale: 1.2 },
      { text: 'The Little Robot Who Waited for Visitors', color: '#FFFFFF', scale: 0.9 },
    ],
    narration:
      'Welcome to Surveyor 3: The Little Robot Who Waited for Visitors, narrated by Lily! Tap Open Book to start our Moon adventure.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the dark blue book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-surveyor',
    chapterTitle: 'Meet Surveyor 3',
    popupLines: [
      { text: "Today we're going on an adventure to the Moon", color: '#7CE8FF', scale: 0.96 },
      { text: 'to meet a little robot named Surveyor 3!', color: '#FFE066', scale: 0.98 },
    ],
    narration:
      "Hello, everyone! Today, we're going on a very special adventure to the Moon! And guess what? We're going to meet a little robot named Surveyor 3!",
    actionLabel: 'Wave Hello',
    pageSpreadHint: 'Tap Lily or Surveyor 3 to wave hello',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'why-1967',
    chapterTitle: 'Sent in 1967',
    popupLines: [
      { text: 'Surveyor 3 went to the Moon in 1967!', color: '#FFE066', scale: 1.0 },
      { text: 'Was the ground soft or hard? Could astronauts land safely?', color: '#FFFFFF', scale: 0.88 },
    ],
    narration:
      'Surveyor 3 was sent all the way to the Moon in 1967. But why, you ask? Well, our scientist friends wanted to know what the Moon was like! Was its ground soft? Was it hard? Could astronauts safely land there?',
    actionLabel: 'Inspect Moon',
    pageSpreadHint: 'Tap the scientists to study the Moon',
    soundCue: 'signal',
  },
  {
    index: 3,
    sceneId: 'journey-to-moon',
    chapterTitle: 'Important Mission',
    popupLines: [
      { text: 'And so, Surveyor 3 was given', color: '#7CE8FF', scale: 1.0 },
      { text: 'a very important mission to the Moon!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      'And so, Surveyor 3 was given a very important mission, travelling through space all the way towards the Moon!',
    actionLabel: 'Boost Flight',
    pageSpreadHint: 'Tap Surveyor 3 to zoom toward the Moon',
    soundCue: 'launch',
  },
  {
    index: 4,
    sceneId: 'digging-soil',
    chapterTitle: 'Digging Moon Soil',
    popupLines: [
      { text: 'It landed on the Moon, took pictures,', color: '#FFE066', scale: 0.96 },
      { text: 'and dug little holes with its mechanical arm!', color: '#80FFDB', scale: 0.94 },
    ],
    narration:
      "After travelling all that way, our little friend finally landed on the Moon! It began taking pictures, studying the lunar soil and even digging little holes with its special mechanical arm.",
    actionLabel: 'Dig Lunar Soil',
    pageSpreadHint: 'Tap Surveyor 3 to scoop Moon dust',
    soundCue: 'dig',
  },
  {
    index: 5,
    sceneId: 'mission-ends',
    chapterTitle: 'Resting on the Moon',
    popupLines: [
      { text: 'Days and months passed... its mission ended.', color: '#93C5FD', scale: 0.94 },
      { text: 'It stopped sending signals,', color: '#93C5FD', scale: 0.94 },
      { text: 'and Surveyor 3 looked quietly at Earth.', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      'Days passed... Surveyor 3 continued its work. Then, months passed... But something happened. Its mission eventually came to an end, and our little robot stopped sending signals, sitting on the Moon looking at Earth in the distance.',
    actionLabel: 'Look at Earth',
    pageSpreadHint: 'Tap Surveyor 3 to gaze back at Earth',
    soundCue: 'sleep',
  },
  {
    index: 6,
    sceneId: 'apollo12-landing',
    chapterTitle: 'November 1969',
    popupLines: [
      { text: 'Two years passed... November 1969!', color: '#FFE066', scale: 1.0 },
      { text: 'Two astronauts from Apollo 12 landed nearby!', color: '#7CE8FF', scale: 0.95 },
    ],
    narration:
      'But wait! Was that really the end of its story? Two years passed... And then, in November 1969, something extraordinary happened! Two astronauts from Apollo 12 landed nearby!',
    actionLabel: 'Land Apollo 12',
    pageSpreadHint: 'Tap Apollo 12 Lunar Module to touch down',
    soundCue: 'landing',
  },
  {
    index: 7,
    sceneId: 'visitors-arrive',
    chapterTitle: 'Surprise Visitors!',
    popupLines: [
      { text: 'They walked over to Surveyor 3—', color: '#80FFDB', scale: 1.0 },
      { text: 'our little friend finally had visitors!', color: '#FFE066', scale: 1.0 },
    ],
    narration:
      'Can you guess what they did next? They walked over to Surveyor 3 and our little friend finally had visitors!',
    actionLabel: 'Greet Visitors',
    pageSpreadHint: 'Tap the astronauts to walk over and say hi',
    soundCue: 'happy',
  },
  {
    index: 8,
    sceneId: 'examining-surveyor',
    chapterTitle: 'Conrad & Bean',
    popupLines: [
      { text: 'Charles Conrad and Alan Bean took pictures', color: '#7CE8FF', scale: 0.94 },
      { text: 'and brought parts back to Earth for study!', color: '#FFFFFF', scale: 0.93 },
    ],
    narration:
      'The astronauts Charles Conrad and Alan Bean took pictures, examined the spacecraft and even brought some of its parts back to Earth so scientists could study what two years on the Moon had done to it.',
    actionLabel: 'Snap Photo',
    pageSpreadHint: 'Tap the astronauts to take a picture',
    soundCue: 'camera',
  },
  {
    index: 9,
    sceneId: 'helping-humans',
    chapterTitle: 'Still Teaching Us',
    popupLines: [
      { text: 'Its discoveries helped humans reach the Moon,', color: '#FFE066', scale: 0.94 },
      { text: 'and it still had something important to teach us!', color: '#80FFDB', scale: 0.92 },
    ],
    narration:
      'Surveyor 3 had stopped working, but its discoveries had helped humans prepare for their own journey to the Moon. And even after its mission ended, it still had something important to teach us!',
    actionLabel: 'Share Discovery',
    pageSpreadHint: 'Tap to celebrate Surveyor 3’s big discoveries',
    soundCue: 'signal',
  },
  {
    index: 10,
    sceneId: 'make-a-difference',
    chapterTitle: 'Make a Difference',
    popupLines: [
      { text: 'The help you give continues to make a difference!', color: '#FFE066', scale: 0.94 },
      { text: 'The End · Love, Lily & Surveyor 3', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "You see, even when you think your job is finished, the things you've learned and the help you've given can continue to make a difference! The end.",
    actionLabel: 'Wave with Lily',
    pageSpreadHint: 'Tap Lily or Surveyor 3 on the Moon to wave',
    soundCue: 'fanfare',
  },
];

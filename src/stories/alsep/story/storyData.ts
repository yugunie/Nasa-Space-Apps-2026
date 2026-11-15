export type StorySceneId =
  | 'cover'
  | 'meet-alsep'
  | 'little-laboratories'
  | 'astronauts-setup'
  | 'moonquakes-and-more'
  | 'never-went-home'
  | 'sending-data-years'
  | 'september-1977'
  | 'knowledge-remains'
  | 'change-the-world';

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
    | 'setup'
    | 'quake'
    | 'wave'
    | 'signal'
    | 'sleep'
    | 'fanfare';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'ALSEP', color: '#FFE066', scale: 1.25 },
      { text: 'The Little Laboratories That Never Went Home', color: '#FFFFFF', scale: 0.88 },
    ],
    narration:
      'Welcome to ALSEP: The Little Laboratories That Never Went Home, narrated by Lily! Tap Open Book to visit the Moon.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the dark blue book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-alsep',
    chapterTitle: 'Meet ALSEP',
    popupLines: [
      { text: "Today we're visiting the Moon again—", color: '#7CE8FF', scale: 0.96 },
      { text: 'to meet a team of helpers called ALSEP!', color: '#FFE066', scale: 0.96 },
    ],
    narration:
      "Hello guys! Today, we're visiting the Moon again! But this time, we're not meeting just one little explorer. We're meeting a whole team of scientific helpers called ALSEP!",
    actionLabel: 'Say Hello',
    pageSpreadHint: 'Tap Lily or the ALSEP team to wave hello',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'little-laboratories',
    chapterTitle: 'Moon Science Labs',
    popupLines: [
      { text: 'Apollo Lunar Surface Experiments Package:', color: '#93C5FD', scale: 0.9 },
      { text: "The Moon's little science laboratories!", color: '#FFE066', scale: 1.0 },
    ],
    narration:
      "ALSEP stands for Apollo Lunar Surface Experiments Package. That's a very long name, isn't it? Let's just call them the Moon's little science laboratories!",
    actionLabel: 'Power Up Labs',
    pageSpreadHint: 'Tap the ALSEP station to light up the labs',
    soundCue: 'signal',
  },
  {
    index: 3,
    sceneId: 'astronauts-setup',
    chapterTitle: 'Setting Up ALSEP',
    popupLines: [
      { text: 'Astronauts brought special instruments', color: '#80FFDB', scale: 0.96 },
      { text: 'to understand how the Moon worked!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "You see, when astronauts visited the Moon, they brought special instruments with them. Their job wasn't to explore the Moon like a rover. Instead, they were there to help our scientist friends understand how the Moon worked!",
    actionLabel: 'Place Instruments',
    pageSpreadHint: 'Tap the astronauts to set up the ALSEP gear',
    soundCue: 'setup',
  },
  {
    index: 4,
    sceneId: 'moonquakes-and-more',
    chapterTitle: 'Listening for Moonquakes',
    popupLines: [
      { text: 'Some listened for moonquakes!', color: '#FFE066', scale: 1.0 },
      { text: 'Others studied magnetic fields & temperature.', color: '#7CE8FF', scale: 0.9 },
    ],
    narration:
      "Some of these little helpers listened for moonquakes! Others studied the Moon's magnetic field, its temperature and even the tiny movements happening beneath its surface.",
    actionLabel: 'Sense Moonquake',
    pageSpreadHint: 'Tap the seismometer to pulse a gentle moonquake',
    soundCue: 'quake',
  },
  {
    index: 5,
    sceneId: 'never-went-home',
    chapterTitle: 'Never Went Home',
    popupLines: [
      { text: "These little labs weren't going back home—", color: '#FFE066', scale: 0.95 },
      { text: 'they stayed to collect data after everyone left!', color: '#FFFFFF', scale: 0.9 },
    ],
    narration:
      "And here's also an interesting part! Unlike the astronauts, these little laboratories weren't going back home. They were carefully placed on the Moon so they could continue collecting scientific information even after everyone had left.",
    actionLabel: 'Wave Goodbye',
    pageSpreadHint: 'Tap the astronauts to wave goodbye to ALSEP',
    soundCue: 'wave',
  },
  {
    index: 6,
    sceneId: 'sending-data-years',
    chapterTitle: 'Years of Signals',
    popupLines: [
      { text: 'Days, months, and years passed...', color: '#80FFDB', scale: 0.96 },
      { text: 'ALSEP kept sending data all the way to Earth!', color: '#FFE066', scale: 0.94 },
    ],
    narration:
      'Days passed... Months passed... Years passed... And our little laboratories kept sending information all the way back to Earth. Our scientist friends were learning more and more about the Moon, even though they were millions of steps away from their experiments.',
    actionLabel: 'Beam Signals',
    pageSpreadHint: 'Tap to send lunar data waves to Earth scientists',
    soundCue: 'signal',
  },
  {
    index: 7,
    sceneId: 'september-1977',
    chapterTitle: 'September 1977',
    popupLines: [
      { text: 'In September 1977, NASA switched off ALSEP.', color: '#93C5FD', scale: 0.93 },
      { text: 'Yet their discoveries stayed valuable forever!', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Eventually, in September 1977, NASA switched off the ALSEP experiments. Their long journey of scientific discovery had finally come to an end. But the information they had collected remained valuable to scientists!',
    actionLabel: 'Rest Quietly',
    pageSpreadHint: 'Tap ALSEP resting peacefully under Earthlight',
    soundCue: 'sleep',
  },
  {
    index: 8,
    sceneId: 'knowledge-remains',
    chapterTitle: 'Knowledge Left Behind',
    popupLines: [
      { text: 'The knowledge they left behind', color: '#7CE8FF', scale: 0.98 },
      { text: 'kept helping humanity understand the Moon!', color: '#FFE066', scale: 0.93 },
    ],
    narration:
      'Even though these little laboratories could no longer send signals, the knowledge they left behind continued helping humanity understand the Moon. And that teaches us something important.',
    actionLabel: 'Study Data',
    pageSpreadHint: 'Tap to explore the Moon knowledge ALSEP shared',
    soundCue: 'happy',
  },
  {
    index: 9,
    sceneId: 'change-the-world',
    chapterTitle: 'Change the World',
    popupLines: [
      { text: 'Helping others discover can change the world!', color: '#FFE066', scale: 0.94 },
      { text: 'The End · Love, Lily & ALSEP', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "You don't always have to be the one who makes the biggest discoveries. Sometimes, simply helping others discover something new can change the world! The end.",
    actionLabel: 'Wave with Lily',
    pageSpreadHint: 'Tap Lily or the ALSEP team on the Moon to wave',
    soundCue: 'fanfare',
  },
];

export type StorySceneId =
  | 'cover'
  | 'meet-near'
  | 'leaving-earth'
  | 'passing-mathilde'
  | 'happily-in-space'
  | 'missed-the-stop'
  | 'back-on-track'
  | 'orbiting-eros'
  | 'unexpected-plan'
  | 'landed-on-eros'
  | 'nothing-impossible'
  | 'grandpa-eros'
  | 'never-forgotten';

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
    | 'wave'
    | 'worry'
    | 'signal'
    | 'camera'
    | 'surprise'
    | 'proud'
    | 'fanfare';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'NEAR Shoemaker', color: '#FFE066', scale: 1.2 },
      { text: "Jacob & Lily's Space Adventure", color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      "Hi, I'm Jacob! Welcome to Near's Shoemaker, our 3D storybook with Lily! Tap Open Book to meet our friend Near.",
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the dark purple book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-near',
    chapterTitle: 'Meet Near!',
    popupLines: [
      { text: 'This is NEAR Shoemaker, our friend!', color: '#FFE066', scale: 0.96 },
      { text: 'He is a robotic space probe called Near!', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      "Hi everyone, I'm Jacob! This is NEAR Shoemaker. It is our friend. Let us call him Near—he is known as a robotic space probe!",
    actionLabel: 'Say Hi to Near',
    pageSpreadHint: 'Tap Near beside Jacob and Lily to spin and wave',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'leaving-earth',
    chapterTitle: 'Leaving Earth',
    popupLines: [
      { text: 'One mission: snap pictures of asteroid Eros!', color: '#7CE8FF', scale: 0.94 },
      { text: 'Bye-bye Earth! Scientists wave goodbye!', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Near has one mission. He must go to space and send pictures of asteroid Eros to our scientist friends. One day, Near leaves Earth!',
    actionLabel: 'Launch Near',
    pageSpreadHint: 'Tap Near to zoom from Earth toward Eros',
    soundCue: 'launch',
  },
  {
    index: 3,
    sceneId: 'passing-mathilde',
    chapterTitle: 'Hello, Mathilde!',
    popupLines: [
      { text: "Near passed Eros's friend Mathilde!", color: '#D8B4FE', scale: 0.96 },
      { text: 'Wave hello as Near flies right by!', color: '#FFE066', scale: 0.94 },
    ],
    narration:
      "While Near was on his way, he passed by a friend of Eros's. This is Mathilde! Mathilde and Near waved hello to each other!",
    actionLabel: 'Wave Hello',
    pageSpreadHint: 'Tap Mathilde or Near to wave in space',
    soundCue: 'wave',
  },
  {
    index: 4,
    sceneId: 'happily-in-space',
    chapterTitle: 'Happy in Space',
    popupLines: [
      { text: 'Everything was going great in deep space!', color: '#80FFDB', scale: 0.96 },
      { text: 'Near zoomed happily... until...', color: '#FFE066', scale: 0.95 },
    ],
    narration:
      'Everything was going great! Near was cruising happily through the sparkling stars in space... Until...',
    actionLabel: 'Zoom Happily',
    pageSpreadHint: 'Tap Near gliding through the stars',
    soundCue: 'happy',
  },
  {
    index: 5,
    sceneId: 'missed-the-stop',
    chapterTitle: 'Passed His Stop!',
    popupLines: [
      { text: 'Oh no! Near passed his stop!', color: '#FF9E80', scale: 1.0 },
      { text: 'Scientists lost connection—Near is crying!', color: '#FFFFFF', scale: 0.9 },
    ],
    narration:
      "Near passed his stop! Shocked in the middle of nowhere, our scientist friends lost connection. Oh no! They can't help Near!",
    actionLabel: 'Send SOS',
    pageSpreadHint: 'Tap poor crying Near to flash an SOS signal',
    soundCue: 'worry',
  },
  {
    index: 6,
    sceneId: 'back-on-track',
    chapterTitle: 'Back on Track!',
    popupLines: [
      { text: 'Hours passed... Signal found! Woohoo!', color: '#80FFDB', scale: 0.98 },
      { text: 'Scientists guided Near back on track!', color: '#FFE066', scale: 0.93 },
    ],
    narration:
      'Hours passed, and finally Near heard from our scientist friends! They helped Near go back on the right track. Woohoo!',
    actionLabel: 'Beam Guide Signal',
    pageSpreadHint: 'Tap the radio dish or happy Near to beam back',
    soundCue: 'signal',
  },
  {
    index: 7,
    sceneId: 'orbiting-eros',
    chapterTitle: 'Orbiting Eros',
    popupLines: [
      { text: 'Near arrived at asteroid Eros!', color: '#FFE066', scale: 1.02 },
      { text: 'Orbiting Eros & snapping close-up photos!', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Finally, Near arrives at his destination and completes his mission—orbiting asteroid Eros with his camera ready!',
    actionLabel: 'Snap Photos',
    pageSpreadHint: 'Tap Near orbiting Eros to flash his camera',
    soundCue: 'camera',
  },
  {
    index: 8,
    sceneId: 'unexpected-plan',
    chapterTitle: 'Come Back? Wait...',
    popupLines: [
      { text: 'Scientists said: "You can come back now!"', color: '#7CE8FF', scale: 0.94 },
      { text: 'But Near had a daring surprise idea!', color: '#FFE066', scale: 0.94 },
    ],
    narration:
      'Our scientist friends only needed Near to take pictures from far away, and told him he could come back. But Near did something unexpected!',
    actionLabel: 'Spark Idea',
    pageSpreadHint: 'Tap Near to light up his big landing idea',
    soundCue: 'surprise',
  },
  {
    index: 9,
    sceneId: 'landed-on-eros',
    chapterTitle: 'Landed on Eros!',
    popupLines: [
      { text: 'Near landed onto Eros without landing legs!', color: '#FFE066', scale: 0.93 },
      { text: '"But how?!" asked shocked scientists!', color: '#FF9E80', scale: 0.94 },
    ],
    narration:
      'Near landed onto Eros, even though he did not have the structure to do so! "But how?!" asked the shocked scientist friends!',
    actionLabel: 'Gentle Touchdown',
    pageSpreadHint: 'Tap Near on Eros or the shocked scientists',
    soundCue: 'surprise',
  },
  {
    index: 10,
    sceneId: 'nothing-impossible',
    chapterTitle: 'Nothing Is Impossible!',
    popupLines: [
      { text: '"Because nothing is impossible!"', color: '#FFE066', scale: 1.02 },
      { text: 'Replied smug little Near on asteroid Eros!', color: '#80FFDB', scale: 0.92 },
    ],
    narration:
      '"Because nothing is impossible!" replied Near proudly with a smug grin right on the asteroid!',
    actionLabel: 'Strike a Pose',
    pageSpreadHint: 'Tap smug Near on Eros to sparkle',
    soundCue: 'proud',
  },
  {
    index: 11,
    sceneId: 'grandpa-eros',
    chapterTitle: 'Ancient Grandpa Eros',
    popupLines: [
      { text: 'Eros may be as old as the universe!', color: '#D8B4FE', scale: 0.96 },
      { text: 'Not just some rock—Grandpa Eros!', color: '#FFE066', scale: 0.96 },
    ],
    narration:
      'All the photos Near sent helped our scientist friends so much! Eros is very old—maybe as old as the universe! Not just some rock!',
    actionLabel: 'Greet Grandpa Eros',
    pageSpreadHint: 'Tap Grandpa Eros to tip his glasses and chuckle',
    soundCue: 'camera',
  },
  {
    index: 12,
    sceneId: 'never-forgotten',
    chapterTitle: 'Never Forgotten',
    popupLines: [
      { text: 'Near lost signal, yet will never be forgotten!', color: '#80FFDB', scale: 0.92 },
      { text: 'Astronaut Jacob hugs Near · The End', color: '#FFE066', scale: 0.96 },
    ],
    narration:
      'Near lost contact with our scientist friends in the end and never regained signal. But his scans helped them so much—Near will never be forgotten! The end.',
    actionLabel: 'Hug Near!',
    pageSpreadHint: 'Tap astronaut Jacob hugging Near and cheering Lily',
    soundCue: 'fanfare',
  },
];

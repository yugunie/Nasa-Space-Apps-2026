export type StorySceneId =
  | 'cover'
  | 'meet-near'
  | 'mission'
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
      { text: 'NEAR Shoemaker', color: '#FFE066', scale: 1.25 },
      { text: 'Told by Jacob & Lily', color: '#FFFFFF', scale: 0.9 },
    ],
    narration:
      'Welcome to NEAR Shoemaker, a space story told by Jacob and Lily! Click Open Book to start the adventure.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'meet-near',
    chapterTitle: 'Meet NEAR',
    popupLines: [
      { text: 'This is NEAR Shoemaker.', color: '#FFE066', scale: 1.05 },
      { text: 'He is our robotic space probe friend!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      "Hi! I'm Jacob, and this is Lily. This is NEAR Shoemaker. Let's call him NEAR! He is our friend, and he is a robotic space probe.",
    actionLabel: 'Wave to NEAR',
    pageSpreadHint: 'Tap NEAR to say hello',
    soundCue: 'happy',
  },
  {
    index: 2,
    sceneId: 'mission',
    chapterTitle: 'One Big Mission',
    popupLines: [
      { text: 'NEAR has one big mission:', color: '#7CE8FF', scale: 1.02 },
      { text: 'Take pictures of asteroid Eros for our scientists!', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      'NEAR has one mission. He must fly into space and send pictures of asteroid Eros back to our scientist friends!',
    actionLabel: 'Preview Route',
    pageSpreadHint: 'Tap Eros or NEAR to trace the path',
    soundCue: 'happy',
  },
  {
    index: 3,
    sceneId: 'blast-off',
    chapterTitle: 'Leaving Earth',
    popupLines: [
      { text: 'One day, NEAR blasts off from Earth!', color: '#FFE066', scale: 1.04 },
      { text: '"Bye-bye, NEAR!" wave the scientists.', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      'One day, NEAR leaves Earth to complete his mission. Our scientist friends wave goodbye from the ground!',
    actionLabel: 'Rocket Boost',
    pageSpreadHint: 'Tap NEAR for extra thrusters',
    soundCue: 'boost',
  },
  {
    index: 4,
    sceneId: 'mathilde',
    chapterTitle: 'Hello, Mathilde!',
    popupLines: [
      { text: 'On the way, NEAR passed asteroid Mathilde.', color: '#FFFFFF', scale: 0.98 },
      { text: 'They waved hello in deep space!', color: '#FFE066', scale: 1.0 },
    ],
    narration:
      "While NEAR was on his way, he passed by a friend of Eros. This is Mathilde! Mathilde and NEAR happily waved at each other.",
    actionLabel: 'Wave Back',
    pageSpreadHint: 'Tap Mathilde or NEAR to wave',
    soundCue: 'happy',
  },
  {
    index: 5,
    sceneId: 'passed-stop',
    chapterTitle: 'Uh-Oh! Missed Stop',
    popupLines: [
      { text: 'Everything was going great... UNTIL...', color: '#7CE8FF', scale: 0.96 },
      { text: 'NEAR passed his stop! Oh no!', color: '#FF8A80', scale: 1.08 },
    ],
    narration:
      'Everything was going great... until... NEAR passed his stop! Oh no! NEAR was shocked in the middle of nowhere.',
    actionLabel: 'Spin Around',
    pageSpreadHint: 'Tap NEAR to look for Eros',
    soundCue: 'uhoh',
  },
  {
    index: 6,
    sceneId: 'lost-connection',
    chapterTitle: 'Lost Signal',
    popupLines: [
      { text: 'Our scientists lost connection!', color: '#FF8A80', scale: 1.04 },
      { text: 'Poor NEAR felt lost and started to cry.', color: '#FFFFFF', scale: 0.95 },
    ],
    narration:
      "Our scientist friends lost connection! Oh no! They couldn't help NEAR, and poor NEAR felt so lonely.",
    actionLabel: 'Send Signal',
    pageSpreadHint: 'Tap the dish to try calling NEAR',
    soundCue: 'sad',
  },
  {
    index: 7,
    sceneId: 'back-on-track',
    chapterTitle: 'Back on Track!',
    popupLines: [
      { text: 'Hours passed... and FINALLY! Signal restored!', color: '#80FFDB', scale: 1.0 },
      { text: 'The scientists steered NEAR back on track. Woohoo!', color: '#FFE066', scale: 0.95 },
    ],
    narration:
      'Hours passed, and finally! NEAR heard from our scientist friends! They helped NEAR get back on the right track. Woohoo!',
    actionLabel: 'Celebrate',
    pageSpreadHint: 'Tap NEAR for a happy flip',
    soundCue: 'fanfare',
  },
  {
    index: 8,
    sceneId: 'orbiting-eros',
    chapterTitle: 'Camera Time at Eros',
    popupLines: [
      { text: 'NEAR arrived at asteroid Eros!', color: '#FFE066', scale: 1.04 },
      { text: 'Click! Snap! Taking pictures from orbit!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      'Finally, NEAR arrives at his destination and completes his mission! He orbits Eros with his camera, snapping awesome photos.',
    actionLabel: 'Snap Photo',
    pageSpreadHint: 'Tap NEAR to take a space photo',
    soundCue: 'camera',
  },
  {
    index: 9,
    sceneId: 'unexpected-landing',
    chapterTitle: 'Unexpected Landing',
    popupLines: [
      { text: '"You can come back now," said the scientists.', color: '#7CE8FF', scale: 0.95 },
      { text: 'Instead... NEAR landed right onto Eros!', color: '#FFE066', scale: 1.02 },
    ],
    narration:
      'Our scientist friends only needed NEAR to take pictures from far away. But NEAR did something unexpected... he landed onto Eros without landing legs!',
    actionLabel: 'Touch Down',
    pageSpreadHint: 'Tap NEAR to bounce gently on Eros',
    soundCue: 'boost',
  },
  {
    index: 10,
    sceneId: 'nothing-impossible',
    chapterTitle: 'Nothing Is Impossible!',
    popupLines: [
      { text: '"But HOW?!" asked the shocked scientists.', color: '#FF9EBB', scale: 0.98 },
      { text: '"Because nothing is impossible!" replied NEAR.', color: '#FFE066', scale: 1.02 },
    ],
    narration:
      '"But how?!" asked our shocked scientist friends. "Because nothing is impossible!" replied NEAR with a big proud smile.',
    actionLabel: 'Cool Pose',
    pageSpreadHint: 'Tap NEAR to flash his shades',
    soundCue: 'fanfare',
  },
  {
    index: 11,
    sceneId: 'grandpa-eros',
    chapterTitle: 'Grandpa Eros',
    popupLines: [
      { text: 'NEAR’s photos taught us something amazing:', color: '#FFFFFF', scale: 0.96 },
      { text: 'Eros is as old as the universe! A grandpa rock!', color: '#FFE066', scale: 1.0 },
    ],
    narration:
      'All the photos NEAR sent helped our scientist friends so much! Eros is very old—maybe as old as the universe! Not just some ordinary rock.',
    actionLabel: 'Tap Grandpa Eros',
    pageSpreadHint: 'Tap Grandpa Eros for a wise wink',
    soundCue: 'gentle',
  },
  {
    index: 12,
    sceneId: 'never-forgotten',
    chapterTitle: 'Never Forgotten',
    popupLines: [
      { text: 'NEAR’s radio fell quiet on Eros at last.', color: '#7CE8FF', scale: 0.96 },
      { text: 'Thank you, NEAR! You will never be forgotten.', color: '#FFE066', scale: 1.02 },
    ],
    narration:
      "NEAR lost contact with our scientist friends in the end, and never regained signal. But NEAR's scans helped them so much! He will never be forgotten.",
    actionLabel: 'Send Thanks',
    pageSpreadHint: 'Tap to send shining thank-you stars',
    soundCue: 'gentle',
  },
  {
    index: 13,
    sceneId: 'cosmic-hug',
    chapterTitle: 'The End',
    popupLines: [
      { text: 'The End!', color: '#FFE066', scale: 1.2 },
      { text: 'Big space hugs from Jacob, Lily & NEAR!', color: '#FFFFFF', scale: 0.96 },
    ],
    narration:
      'The end! Jacob put on his astronaut suit to give NEAR Shoemaker the biggest cosmic hug ever. Thanks for reading!',
    actionLabel: 'Big Space Hug',
    pageSpreadHint: 'Tap Jacob or NEAR for a cosmic hug',
    soundCue: 'fanfare',
  },
];

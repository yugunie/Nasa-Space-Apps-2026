export type StorySceneId =
  | 'cover'
  | 'mission-to-mars'
  | 'landing-2004'
  | 'hematite-blueberries'
  | 'salt-and-water'
  | 'three-month-worry'
  | 'kept-sending-data'
  | 'dust-storm-14-years'
  | 'preparing-humans'
  | 'mars-climate-data'
  | 'life-and-aliens';

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
    | 'scan'
    | 'water'
    | 'worry'
    | 'signal'
    | 'storm'
    | 'fanfare';
}

export const STORY_PAGES: StoryPage[] = [
  {
    index: 0,
    sceneId: 'cover',
    chapterTitle: 'Book Cover',
    popupLines: [
      { text: 'Opportunity Rover', color: '#FFE066', scale: 1.2 },
      { text: 'MER-B · Exploring Mars', color: '#FFFFFF', scale: 0.92 },
    ],
    narration:
      'Welcome to Opportunity Rover, formally known as MER-B! Tap Open Book to join our journey to Mars.',
    actionLabel: 'Open Book',
    pageSpreadHint: 'Tap the dark red book cover to open',
    soundCue: 'open',
  },
  {
    index: 1,
    sceneId: 'mission-to-mars',
    chapterTitle: 'Off to Mars!',
    popupLines: [
      { text: 'Ever wondered if life existed on Mars?', color: '#FF9E80', scale: 0.98 },
      { text: 'Scientists sent Opportunity rover (MER-B)!', color: '#FFFFFF', scale: 0.93 },
    ],
    narration:
      'Ever wondered if life truly existed on Mars? Scientists did. And so, they sent Opportunity rover, formally known as MER-B, to Mars!',
    actionLabel: 'Launch MER-B',
    pageSpreadHint: 'Tap MER-B to zoom from Earth to Mars',
    soundCue: 'launch',
  },
  {
    index: 2,
    sceneId: 'landing-2004',
    chapterTitle: 'Landing on Mars',
    popupLines: [
      { text: 'Left Earth July 2003 · Landed Jan 24, 2004!', color: '#FFE066', scale: 0.95 },
      { text: 'MER-B is a solar-powered Mars explorer!', color: '#FFFFFF', scale: 0.93 },
    ],
    narration:
      'MER-B, a solar-powered robot, left Earth on July 2003, landing onto Mars on January 24, 2004 successfully!',
    actionLabel: 'Roll Forward',
    pageSpreadHint: 'Tap MER-B on Mars to roll across the crater',
    soundCue: 'happy',
  },
  {
    index: 3,
    sceneId: 'hematite-blueberries',
    chapterTitle: 'Hematite Blueberries',
    popupLines: [
      { text: 'MER-B found grey spheres full of hematite!', color: '#7CE8FF', scale: 0.95 },
      { text: 'Hematite typically forms in liquid water!', color: '#FFE066', scale: 0.94 },
    ],
    narration:
      'MER-B found blueberry sized spheres, and these spheres had so much hematite! Fact: Hematite is a mineral that typically forms in liquid water!',
    actionLabel: 'Scan Spheres',
    pageSpreadHint: 'Tap MER-B to inspect the grey hematite spheres',
    soundCue: 'scan',
  },
  {
    index: 4,
    sceneId: 'salt-and-water',
    chapterTitle: 'Salt & Ancient Water',
    popupLines: [
      { text: 'Layered bedrock had components of salt!', color: '#80FFDB', scale: 0.96 },
      { text: 'Water is the source of life!', color: '#FFE066', scale: 1.0 },
    ],
    narration:
      'Furthermore, layered bedrock was analyzed, and components of salt were found! And as we all know: water is the source of life essentially!',
    actionLabel: 'Test Bedrock',
    pageSpreadHint: 'Tap the salt crystals and ancient water pool',
    soundCue: 'water',
  },
  {
    index: 5,
    sceneId: 'three-month-worry',
    chapterTitle: 'Only 3 Months?',
    popupLines: [
      { text: 'Scientists thought MER-B would last 3 months,', color: '#FF9E80', scale: 0.93 },
      { text: 'covered quickly by Martian dust!', color: '#FFFFFF', scale: 0.95 },
    ],
    narration:
      'MER-B was thought to only survive for about 3 months, as our scientist friends thought the solar panels would quickly be covered by dust.',
    actionLabel: 'Brush Dust',
    pageSpreadHint: 'Tap the scientists’ thought cloud above',
    soundCue: 'worry',
  },
  {
    index: 6,
    sceneId: 'kept-sending-data',
    chapterTitle: 'Sending Data Anyway!',
    popupLines: [
      { text: 'But MER-B kept sending data anyway!', color: '#80FFDB', scale: 1.04 },
      { text: 'Alive and beaming discoveries to Earth!', color: '#FFFFFF', scale: 0.94 },
    ],
    narration:
      'But MER-B kept sending data anyway! Look how brightly its solar panels shine on Mars!',
    actionLabel: 'Beam Data',
    pageSpreadHint: 'Tap MER-B to beam signals back to Earth',
    soundCue: 'signal',
  },
  {
    index: 7,
    sceneId: 'dust-storm-14-years',
    chapterTitle: '14 Years & Dust Storm',
    popupLines: [
      { text: '14 years passed before a giant dust storm', color: '#FFE066', scale: 0.95 },
      { text: 'blocked sunlight and MER-B lost power.', color: '#FF9E80', scale: 0.95 },
    ],
    narration:
      '14 years passed and MER-B officially lost power, as a storm completely blocked sunlight onto MER-B.',
    actionLabel: 'Swirl Storm',
    pageSpreadHint: 'Tap the dusty crater to swirl the Mars storm',
    soundCue: 'storm',
  },
  {
    index: 8,
    sceneId: 'preparing-humans',
    chapterTitle: 'Preparing Humans',
    popupLines: [
      { text: 'MER-B helped scientists prepare', color: '#7CE8FF', scale: 0.98 },
      { text: 'for humans to visit Mars one day!', color: '#FFE066', scale: 0.98 },
    ],
    narration:
      'MER-B helped the scientists a lot, such as preparing humans to visit Mars!',
    actionLabel: 'Prep Launch',
    pageSpreadHint: 'Tap the astronauts getting ready for Mars',
    soundCue: 'launch',
  },
  {
    index: 9,
    sceneId: 'mars-climate-data',
    chapterTitle: 'Mars Climate Data',
    popupLines: [
      { text: 'MER-B shared Mars climate data', color: '#FFE066', scale: 1.0 },
      { text: 'from studying Martian dust storms!', color: '#FFFFFF', scale: 0.95 },
    ],
    narration:
      'MER-B also provided scientists with valuable climate data by watching storms on Mars!',
    actionLabel: 'Track Storms',
    pageSpreadHint: 'Tap the Martian storm vortexes to measure wind',
    soundCue: 'storm',
  },
  {
    index: 10,
    sceneId: 'life-and-aliens',
    chapterTitle: 'Never Stop Looking!',
    popupLines: [
      { text: 'Life was possible on Mars—maybe even aliens!', color: '#80FFDB', scale: 0.94 },
      { text: "Don't ever give up looking! · The End", color: '#FFE066', scale: 0.96 },
    ],
    narration:
      "And MER-B showed that life was possible on Mars! So friends, there are many types of living out there, potentially aliens. Don't ever give up looking! The end.",
    actionLabel: 'Wave with Aliens',
    pageSpreadHint: 'Tap the friendly Mars aliens and MER-B to wave',
    soundCue: 'fanfare',
  },
];

export interface StorylineData {
  id: string;
  title: string;
  subtitle: string;
  epoch: string;
  summary: string;
  fullNarrative: string[];
  telemetry: {
    coordinates: string;
    stellarClass: string;
    temperature: string;
    distanceLightYears: string;
    phenomenon: string;
  };
  archivalQuote: {
    text: string;
    author: string;
  };
  interactivePrompt: string;
  accentColor: string;
}

export interface Chapter {
  id: number;
  romanNumeral: string;
  title: string;
  leftPageTitle: string;
  leftPageSubtitle: string;
  leftPageText: string[];
  leftPageNote: string;
  rightPageIllustration: 'nebula' | 'blackhole' | 'pulsar' | 'dysonsphere';
  rightPageTitle: string;
  storyline: StorylineData;
}

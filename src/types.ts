export interface QuestlineData {
  questlineId: string;
  frameSize: {
    width: number;
    height: number;
  };
  background?: {
    exportUrl: string;
  };
  quests: Quest[];
}

export interface Quest {
  questKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  lockedImg: string;
  closedImg: string;
  doneImg: string;
  isFlattened?: boolean;
}

export interface QuestState {
  [questKey: string]: 'locked' | 'open' | 'closed';
}

export interface ExtractedAssets {
  questlineData: QuestlineData;
  backgroundImage?: string;
  questImages: {
    [questKey: string]: {
      locked?: string;
      closed?: string;
      done?: string;
    };
  };
} 
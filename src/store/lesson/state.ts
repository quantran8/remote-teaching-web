export enum ExposureType {
  SONG = "song",
  VIDEO = "video",
  CHANT = "chant",
  POEM = "poem",
  BIG_BOOK = "bigbook",
  PHONOGRAM = "phonogram",
  TRANSITION = "transition",
  READING = "reading",
  WRITING = "writing",
  VPC = "vpc",
  STORY = "story",
  ACTIVITY = "activity",
  STORY_DICTIONARY = "Story Dictionary",
}

export const ExposureTypeFromValue = (val: number) => {
  if (val === 0) return ExposureType.TRANSITION;
  if (val === 12) return ExposureType.WRITING;
  if (val === 13) return ExposureType.READING;
  if (val === 14) return ExposureType.SONG;
  if (val === 15) return ExposureType.ACTIVITY;
  if (val === 16) return ExposureType.STORY;
  if (val === 17) return ExposureType.POEM;
  if (val === 18) return ExposureType.PHONOGRAM;
  if (val === 20) return ExposureType.VPC;
  if (val === 23) return ExposureType.CHANT;
  if (val === 25) return ExposureType.BIG_BOOK;
  if (val === 34) return ExposureType.STORY_DICTIONARY;
  throw new Error("UnSupported Exposure Type " + val);
};

export enum ExposureStatus {
  DEFAULT = 0,
  COMPLETED = 1,
}

export interface Exposure {
  id: string;
  name: string;
  type: ExposureType;
  status: ExposureStatus;
  duration: string;
  items: ExposureItem[];
  teachingActivityBlockItems: ExposureItem[];
  contentBlockItems: ExposureItem[];
  thumbnailURL?: string;
}

export interface ExposureItem {
  id: string;
  name: string;
  media: ExposureItemMedia[];
  textContent?: string;
}

export interface ExposureItemMedia {
  id: string;
  image: {
    url: string;
    width?: number;
    height?: number;
  };
}

export interface LessonState {
  exposures: Exposure[];
  currentExposure?: Exposure;
  nextExposure?: Exposure;
  currentExposureItemMedia?: ExposureItemMedia;
  nextExposureItemMedia?: ExposureItemMedia;
  prevExposureItemMedia?: ExposureItemMedia;
  isBlackout: boolean;
  totalTime: string;
  playedTime: string;
  previousExposure?: Exposure;
  previousExposureItemMedia?: ExposureItemMedia;
}

const state: LessonState = {
  exposures: [],
  currentExposure: undefined,
  nextExposure: undefined,
  currentExposureItemMedia: undefined,
  nextExposureItemMedia: undefined,
  prevExposureItemMedia: undefined,
  isBlackout: false,
  totalTime: "",
  playedTime: "",
  previousExposure: undefined,
  previousExposureItemMedia: undefined,
};

export default state;

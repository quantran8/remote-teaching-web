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
}

export interface ExposureItem {
  id: string;
  name: string;
  media: ExposureItemMedia[];
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
  currentExposureItemMedia?: ExposureItemMedia;
  isBlackout: boolean;
  totalTime: string;
  playedTime: string;
}

const state: LessonState = {
  exposures: [],
  currentExposure: undefined,
  currentExposureItemMedia: undefined,
  isBlackout: false,
  totalTime: "",
  playedTime: "",
};

export default state;
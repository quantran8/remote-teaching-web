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

export const ExposureTypeFromValue = (val: number, name: string) => {
  if (val === 0) return ExposureType.TRANSITION;
  else if (val === 12) return ExposureType.WRITING;
  else if (val === 13) return ExposureType.READING;
  else if (val === 14) return ExposureType.SONG;
  else if (val === 15) return ExposureType.ACTIVITY;
  else if (val === 16) return ExposureType.STORY;
  else if (val === 17) return ExposureType.POEM;
  else if (val === 18) return ExposureType.PHONOGRAM;
  else if (val === 20) return ExposureType.VPC;
  else if (val === 23) return ExposureType.CHANT;
  else if (val === 25) return ExposureType.BIG_BOOK;
  else if (val === 34) return ExposureType.STORY_DICTIONARY;
  else return name;
};

export enum ExposureStatus {
  DEFAULT = 0,
  COMPLETED = 1,
}

export interface Exposure {
  id: string;
  name: string;
  type: string;
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

export interface CropMetadata {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
}

export interface CacheData {
  url: string;
  metadata: CropMetadata;
  base64String: string;
}

export interface CropCache {
  cacheValues: CacheData[];
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
  cropCache?: CropCache;
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
  cropCache: { cacheValues: [] },
};

export default state;

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
  Activity = "activity",
}

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
}

const state: LessonState = {
  exposures: [],
  currentExposure: undefined,
  currentExposureItemMedia: undefined,
};

export default state;

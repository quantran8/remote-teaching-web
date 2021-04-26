import { GetterTree } from "vuex";
import { Exposure, ExposureItemMedia, ExposureStatus, LessonState } from "./state";

const getSeconds = (time: string) => {
  if (!time || time.indexOf(":") === -1) return 0;
  const totalSecondsArr: Array<number> = time.split(":").map((e, index) => {
    const val = parseInt(e);
    if (index === 0) return val * 60 * 60;
    if (index === 1) return val * 60;
    return val;
  });
  let sum = 0;
  for (const s of totalSecondsArr) sum += s;
  return sum;
};
const toStr = (val: number): string => {
  return `${val < 10 ? "0" : ""}${val}`;
};

const secondsToTimeStr = (time: number): string => {
  const hh = Math.floor(time / 3600);
  const mm = Math.floor((time - hh * 3600) / 60);
  const ss = time % 60;
  return `${toStr(hh)}:${toStr(mm)}:${toStr(ss)}`;
};

interface LessonGetterInterface<S> {
  currentExposure(s: S): Exposure | undefined;
  nextExposure(s: S): Exposure | undefined;
  currentExposureItemMedia(s: S): ExposureItemMedia | undefined;
  nextExposureItemMedia(s: S): ExposureItemMedia | undefined;
  prevExposureItemMedia(s: S): ExposureItemMedia | undefined;
  exposures(s: S): Exposure[];
  isBlackOut(s: S): boolean;
  activityStatistic(s: S): string;
  remainingTimeStatistic(s: S): string;
  progressStatistic(s: S): number;
}

interface LessonGetters<S, R> extends GetterTree<S, R>, LessonGetterInterface<S> {}

const getters: LessonGetters<LessonState, any> = {
  currentExposure(s: LessonState): Exposure | undefined {
    return s.currentExposure;
  },
  nextExposure(s: LessonState): Exposure | undefined {
    return s.nextExposure;
  },
  currentExposureItemMedia(s: LessonState): ExposureItemMedia | undefined {
    return s.currentExposureItemMedia;
  },
  nextExposureItemMedia(s: LessonState): ExposureItemMedia | undefined {
    if (!s.currentExposure) return;
    const groupMedia = [];
    for (const item of s.currentExposure?.items) {
      groupMedia.push(item.media);
    }
    const allMedia = groupMedia.flat();
    if (!s.currentExposureItemMedia) return;
    const indexOfMedia = allMedia.indexOf(s.currentExposureItemMedia);
    if (indexOfMedia + 1 < allMedia.length) {
      return (s.nextExposureItemMedia = allMedia[indexOfMedia + 1]);
    } else {
      return (s.nextExposureItemMedia = undefined);
    }
  },
  prevExposureItemMedia(s: LessonState): ExposureItemMedia | undefined {
    if (!s.currentExposure) return;
    const groupMedia = [];
    for (const item of s.currentExposure?.items) {
      groupMedia.push(item.media);
    }
    const allMedia = groupMedia.flat();
    if (!s.currentExposureItemMedia) return;
    const indexOfMedia = allMedia.indexOf(s.currentExposureItemMedia);
    if (indexOfMedia - 1 >= 0) {
      return (s.nextExposureItemMedia = allMedia[indexOfMedia - 1]);
    } else {
      return (s.nextExposureItemMedia = undefined);
    }
  },
  exposures(s: LessonState): Exposure[] {
    return s.exposures;
  },
  isBlackOut(s: LessonState): boolean {
    return s.isBlackout;
  },
  activityStatistic(s: LessonState): string {
    const listExpo: (string | undefined)[] = [];
    s.exposures.filter(expo => listExpo.push(expo.id));
    return s.exposures.length ? `${listExpo.indexOf(s.currentExposure?.id) + 1}/${s.exposures.length}` : "0";
  },
  getPage(s: LessonState): string {
    const listMedia: string[] = [];
    s.currentExposure?.items.map(item => {
      item.media.map(media => {
        listMedia.push(media.id);
      });
    });
    const currentPage: string[] = [];
    if (listMedia.length > 0) {
      listMedia.map(media => {
        if (media == s.currentExposureItemMedia?.id) {
          currentPage.push(media);
        }
      });
    }
    return s.exposures.length ? `${listMedia.indexOf(currentPage[0]) + 1}/${listMedia.length}` : "0";
  },
  remainingTimeStatistic(s: LessonState): string {
    return secondsToTimeStr(getSeconds(s.totalTime) - getSeconds(s.playedTime));
  },
  progressStatistic(s: LessonState): number {
    return getSeconds(s.playedTime) / getSeconds(s.totalTime);
  },
  previousExposure(s: LessonState): Exposure | undefined {
    return s.previousExposure;
  },
  previousExposureItemMedia(s: LessonState): ExposureItemMedia | undefined {
    return s.previousExposureItemMedia;
  },
};

export default getters;

import { GetterTree } from "vuex";
import {
  Exposure,
  ExposureItemMedia,
  ExposureStatus,
  LessonState,
} from "./state";

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
  currentExposureItemMedia(s: S): ExposureItemMedia | undefined;
  exposures(s: S): Exposure[];
  isBlackOut(s: S): boolean;
  activityStatistic(s: S): string;
  remainingTimeStatistic(s: S): string;
  progressStatistic(s: S): number;
}

interface LessonGetters<S, R>
  extends GetterTree<S, R>,
    LessonGetterInterface<S> {}

const getters: LessonGetters<LessonState, any> = {
  currentExposure(s: LessonState): Exposure | undefined {
    return s.currentExposure;
  },
  currentExposureItemMedia(s: LessonState): ExposureItemMedia | undefined {
    return s.currentExposureItemMedia;
  },
  exposures(s: LessonState): Exposure[] {
    return s.exposures;
  },
  isBlackOut(s: LessonState): boolean {
    return s.isBlackout;
  },
  activityStatistic(s: LessonState): string {
    const activityCompleted = s.exposures.filter(
      (e) => e.status === ExposureStatus.COMPLETED
    ).length;
    return s.exposures.length
      ? `${activityCompleted}/${s.exposures.length}`
      : "0";
  },
  remainingTimeStatistic(s: LessonState): string {
    return secondsToTimeStr(getSeconds(s.totalTime) - getSeconds(s.playedTime));
  },
  progressStatistic(s: LessonState): number {
    return getSeconds(s.playedTime) / getSeconds(s.totalTime);
  },
};

export default getters;
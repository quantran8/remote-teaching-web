import { GetterTree } from "vuex";
import { Exposure, ExposureItemMedia, LessonState, ExposureItem } from "./state";
import { getSeconds, secondsToTimeStr } from "@/utils/convertDuration";
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
    const combinedItems = [
      ...s.currentExposure.items,
      ...s.currentExposure.contentBlockItems,
      ...s.currentExposure.teachingActivityBlockItems,
    ].filter((item: ExposureItem) => item.media[0]?.image?.url);
    for (const item of combinedItems) {
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
    const combinedItems = [
      ...s.currentExposure.items,
      ...s.currentExposure.contentBlockItems,
      ...s.currentExposure.teachingActivityBlockItems,
    ].filter((item: ExposureItem) => item.media[0]?.image?.url);
    for (const item of combinedItems) {
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
    if (!s.currentExposure) {
      return "";
    }
    const combinedItems = [
      ...s.currentExposure.items,
      ...s.currentExposure.contentBlockItems,
      ...s.currentExposure.teachingActivityBlockItems,
    ].filter((item: ExposureItem) => item.media[0]?.image?.url);
    combinedItems.map(item => {
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

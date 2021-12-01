import { MutationTree } from "vuex";
import {
  Exposure,
  ExposureStatus,
  ExposureType,
  LessonState,
  ExposureItemMedia,
  CropMetadata,
  TargetsVisibleAll
} from "./state";
import MediaItemTransition from "@/assets/images/transition.png";
import MediaItemLpComplete from "@/assets/images/lp-complete.png";

interface LessonMutationInterface<S> {
  setIsBlackOut(s: S, p: { IsBlackOut: boolean }): void;
  setExposures(s: S, p: { exposures: Exposure[] }): void;
  setCurrentExposure(s: S, p: { id: string }): void;
  setCurrentExposureItemMedia(s: S, p: { id: string }): void;
  setExposureStatus(s: S, p: { id: string; status: ExposureStatus }): void;
  setTotalTime(s: S, payload: { time: string }): void;
  setPlayedTime(s: S, payload: { time: string }): void;
  endCurrentContent(s: S, payload: any): void;
  setTargetsVisibleAll(s: S, payload: TargetsVisibleAll): void;
}

interface LessonMutation<S> extends MutationTree<S>, LessonMutationInterface<S> {}

const mutations: LessonMutation<LessonState> = {
  setIsBlackOut(s: LessonState, p: { IsBlackOut: boolean }) {
    s.isBlackout = p.IsBlackOut;
  },
  setExposures(s: LessonState, p: { exposures: Exposure[] }) {
    s.exposures = p.exposures.map(exposure => {
      if (exposure.type === ExposureType.TRANSITION) {
        const mediaItem: ExposureItemMedia = {
          id: exposure.id,
          image: {
            url: MediaItemTransition,
            width: 1920,
            height: 1080,
          },
        };
        exposure.items.push({
          id: exposure.id,
          name: exposure.name,
          media: [mediaItem],
        });
      }

      if (exposure.type === ExposureType.COMPLETE) {
        const mediaItem: ExposureItemMedia = {
          id: exposure.id,
          image: {
            url: MediaItemLpComplete,
            width: 1920,
            height: 1080,
          },
        };
        exposure.items.push({
          id: exposure.id,
          name: exposure.name,
          media: [mediaItem],
        });
      }
      return exposure;
    });
  },
  setCurrentExposure(s: LessonState, p: { id: string }) {
    const totalExposures = s.exposures.length;

    s.exposures.forEach((e, i) => {
      // find the matched exposure and set as current exposure
      if (e.id === p.id) {
        s.currentExposure = e;

        // re-assign nextExposure and previousExposure
        s.nextExposure =
          i < totalExposures - 1 // not the last exposure
            ? s.exposures[i + 1]
            : undefined;
        s.previousExposure =
          i > 0 // not the first exposure
            ? s.exposures[i - 1]
            : undefined;

        // found the matched exposure, then break the loop.
        return false;
      }
      return true;
    });

    // set the first media item to currentExposureItemMedia
    if (s.currentExposure && s.currentExposure.items.length > 0) {
      s.currentExposureItemMedia = undefined;
      const firstItem = s.currentExposure.items[0];
      if (firstItem.media.length > 0) {
        s.currentExposureItemMedia = firstItem.media[0];
      }
    }
  },
  setCurrentExposureItemMedia(s: LessonState, p: { id: string }) {
    if (!s.currentExposure) return;
    const combinedItems = [...s.currentExposure.items, ...s.currentExposure.contentBlockItems, ...s.currentExposure.teachingActivityBlockItems];
    for (const item of combinedItems) {
      const matchItemMedia = item.media.find(m => m.id === p.id);
      if (matchItemMedia) {
        s.currentExposureItemMedia = item.media.find(m => m.id === p.id);
        if (s.currentExposureItemMedia) break;
      }
    }
  },
  setExposureStatus(s: LessonState, p: { id: string; status: ExposureStatus }) {
    const exposure = s.exposures.find(e => e.id === p.id);
    if (exposure) {
      if (p.status) {
        exposure.status = p.status;
      }
      if (exposure === s.currentExposure) {
        s.currentExposure = undefined;
      }
    }
  },
  setTotalTime(s: LessonState, payload: { time: string }) {
    s.totalTime = payload.time;
  },
  setPlayedTime(s: LessonState, payload: { time: string }) {
    s.playedTime = payload.time;
  },
  setPreviousExposure(s: LessonState, p: { id: string }) {
    const exposure = s.exposures.find(e => e.id === p.id);
    s.previousExposure = exposure;
    if (s.previousExposure && s.previousExposure.items.length > 0) {
      s.previousExposureItemMedia = undefined;
      const firstItem = s.previousExposure.items[0];
      if (firstItem.media.length > 0) {
        s.previousExposureItemMedia = firstItem.media[0];
      }
    }
  },
  endCurrentContent(s: LessonState, payload: any) {
    s.currentExposure = undefined;
  },
  setPreviousExposureItemMedia(s: LessonState, p: { id: string }) {
    if (!s.previousExposure) return;
    for (const item of s.previousExposure.items) {
      s.previousExposureItemMedia = item.media.find(m => m.id === p.id);
      if (s.previousExposureItemMedia) break;
    }
  },
  clearLessonData(s: LessonState) {
    s.exposures = [];
    s.currentExposure = undefined;
    s.nextExposure = undefined;
    s.currentExposureItemMedia = undefined;
    s.nextExposureItemMedia = undefined;
    s.prevExposureItemMedia = undefined;
    s.isBlackout = false;
    s.totalTime = "";
    s.playedTime = "";
    s.previousExposure = undefined;
    s.previousExposureItemMedia = undefined;
  },
  storeCacheImage(s: LessonState, payload: { url: string; metadata: CropMetadata; base64String: string }) {
    // checking if existing
    const existingCache = s.cropCache?.cacheValues.find(
      cacheValue => cacheValue.url === payload.url && JSON.stringify(cacheValue.metadata) === JSON.stringify(payload.metadata),
    );

    // exist!, skip
    if (existingCache) {
      return;
    }

    // store cache value
    s.cropCache?.cacheValues.push(payload);
  },
  clearCacheImage(s: LessonState) {
    // clear all cropped image cache
    s.cropCache?.cacheValues.splice(0, s.cropCache?.cacheValues.length);
  },
  setTargetsVisibleAll(s: LessonState, p: TargetsVisibleAll) {
    console.log(p, "pppppppppmmmmmmmmmmm");
    s.targetsVisibleAll = p;
  },
  setTargetsVisibleList(s: LessonState, p: {}) {
    //
  },
};

export default mutations;

import { MutationTree } from "vuex";
import { Exposure, ExposureStatus, ExposureType, LessonState } from "./state";

interface LessonMutationInterface<S> {
  setIsBlackOut(s: S, p: { IsBlackOut: boolean }): void;
  setExposures(s: S, p: { exposures: Exposure[] }): void;
  setCurrentExposure(s: S, p: { id: string }): void;
  setCurrentExposureItemMedia(s: S, p: { id: string }): void;
  setExposureStatus(s: S, p: { id: string; status: ExposureStatus }): void;
  setTotalTime(s: S, payload: { time: string }): void;
  setPlayedTime(s: S, payload: { time: string }): void;
}

interface LessonMutation<S> extends MutationTree<S>, LessonMutationInterface<S> {}

const mutations: LessonMutation<LessonState> = {
  setIsBlackOut(s: LessonState, p: { IsBlackOut: boolean }) {
    s.isBlackout = p.IsBlackOut;
  },
  setExposures(s: LessonState, p: { exposures: Exposure[] }) {
    s.exposures = p.exposures;
  },
  setCurrentExposure(s: LessonState, p: { id: string }) {
    const exposure = s.exposures.find(e => e.id === p.id);
    s.currentExposure = exposure;
    if (exposure?.type === ExposureType.TRANSITION) {
      s.currentExposureItemMedia = undefined;
      return;
    }
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
      exposure.status = p.status;
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
    if (exposure?.type === ExposureType.TRANSITION) {
      s.previousExposureItemMedia = undefined;
      return;
    }
    if (s.previousExposure && s.previousExposure.items.length > 0) {
      s.previousExposureItemMedia = undefined;
      const firstItem = s.previousExposure.items[0];
      if (firstItem.media.length > 0) {
        s.previousExposureItemMedia = firstItem.media[0];
      }
    }
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
};

export default mutations;

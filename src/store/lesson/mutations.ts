import { MutationTree } from "vuex";
import { Exposure, ExposureStatus, ExposureType, LessonState } from "./state";

interface LessonMutationInterface<S> {
  setExposures(s: S, p: { exposures: Exposure[] }): void;
  setCurrentExposure(s: S, p: { id: string }): void;
  setCurrentExposureItemMedia(s: S, p: { id: string }): void;
  setExposureStatus(s: S, p: { id: string; status: ExposureStatus }): void;
}

interface LessonMutation<S>
  extends MutationTree<S>,
    LessonMutationInterface<S> {}

const mutations: LessonMutation<LessonState> = {
  setIsBlackOut(s: LessonState, p: { IsBlackOut: boolean }) {
    s.isBlackout = p.IsBlackOut;
  },
  setExposures(s: LessonState, p: { exposures: Exposure[] }) {
    s.exposures = p.exposures;
  },
  setCurrentExposure(s: LessonState, p: { id: string }) {
    const exposure = s.exposures.find((e) => e.id === p.id);
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
    for (const item of s.currentExposure.items) {
      s.currentExposureItemMedia = item.media.find((m) => m.id === p.id);
      if (s.currentExposureItemMedia) break;
    }
  },
  setExposureStatus(s: LessonState, p: { id: string; status: ExposureStatus }) {
    const exposure = s.exposures.find((e) => e.id === p.id);
    if (exposure) {
      exposure.status = p.status;
      if (exposure === s.currentExposure) {
        s.currentExposure = undefined;
      }
    }
  },
};

export default mutations;

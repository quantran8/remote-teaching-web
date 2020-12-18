import { GetterTree } from "vuex";
import { Exposure, ExposureItemMedia, LessonState } from "./state";

interface LessonGetterInterface<S> {
  currentExposure(s: S): Exposure | undefined;
  currentExposureItemMedia(s: S): ExposureItemMedia | undefined;
  exposures(s: S): Exposure[];
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
};

export default getters;

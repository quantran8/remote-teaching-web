import { LessonPlanModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import {
  Exposure,
  ExposureItem,
  ExposureItemMedia,
  ExposureStatus,
  ExposureTypeFromValue,
  LessonState,
} from "./state";

interface LessonActionsInterface<S, R> {
  setInfo(store: ActionContext<S, R>, payload: any): any;
  setExposures(
    store: ActionContext<S, R>,
    payload: {
      exposures: Exposure[];
    }
  ): any;
  setCurrentExposure(store: ActionContext<S, R>, payload: { id: string }): any;
  setCurrentExposureItemMedia(
    store: ActionContext<S, R>,
    payload: { id: string }
  ): any;
  setExposureStatus(
    store: ActionContext<S, R>,
    payload: { id: string; status: ExposureStatus }
  ): any;
  setIsBlackOut(store: ActionContext<S, R>, p: { IsBlackOut: boolean }): any;
}

interface LessonActions<S, R>
  extends ActionTree<S, R>,
    LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  async setInfo(
    store: ActionContext<LessonState, any>,
    payload: LessonPlanModel
  ) {
    if (!payload) return;
    let signalture = store.rootGetters["contentSignature"];
    if (!signalture) {
      await store.dispatch("loadContentSignature", {}, { root: true });
      signalture = store.rootGetters["contentSignature"];
    }
    console.log("signature", signalture);
    const exposures: Array<Exposure> = payload.contents.map((e) => {
      const items: Array<ExposureItem> = e.contents.map((c) => {
        const media: Array<ExposureItemMedia> = c.page.map((p) => {
          return {
            id: p.id,
            image: {
              url: payload.contentStorageUrl + p.url + signalture,
              width: parseInt(p.resolution.split("X")[0]),
              height: parseInt(p.resolution.split("X")[1]),
            },
          };
        });
        return {
          id: c.id,
          name: c.title,
          media: media,
        };
      });

      return {
        id: e.id,
        name: e.title,
        duration: e.maxDuration,
        status: e.played ? ExposureStatus.COMPLETED : ExposureStatus.DEFAULT,
        type: ExposureTypeFromValue(e.contentType.id),
        items: items,
      };
    });
    store.commit("setIsBlackOut", { IsBlackOut: payload.isBlackout });
    store.commit("setExposures", { exposures: exposures });
    store.commit("setCurrentExposure", { id: payload.contentSelected });
    const exposure = payload.contents.find(
      (e) => e.id === payload.contentSelected
    );
    if (exposure && exposure.pageSelected) {
      store.commit("setCurrentExposureItemMedia", {
        id: exposure.pageSelected,
      });
    }
    store.commit("setPlayedTime", { time: payload.playedTime });
    store.commit("setTotalTime", { time: payload.totalTime });
  },
  setExposures(
    store: ActionContext<LessonState, any>,
    payload: {
      exposures: Exposure[];
    }
  ) {
    store.commit("setExposures", payload);
  },
  setCurrentExposure(
    store: ActionContext<LessonState, any>,
    payload: { id: string }
  ) {
    store.commit("setCurrentExposure", payload);
  },
  setCurrentExposureItemMedia(
    store: ActionContext<LessonState, any>,
    payload: { id: string }
  ) {
    store.commit("setCurrentExposureItemMedia", payload);
  },
  setExposureStatus(
    store: ActionContext<LessonState, any>,
    payload: { id: string; status: ExposureStatus }
  ) {
    store.commit("setExposureStatus", payload);
  },
  setIsBlackOut(
    store: ActionContext<LessonState, any>,
    payload: { IsBlackOut: boolean }
  ) {
    store.commit("setIsBlackOut", payload);
  },
  setPreviousExposure(
	store: ActionContext<LessonState, any>,
    payload: { id: string }
  ) {
	store.commit("setPreviousExposure", payload);
  },
  setPreviousExposureItemMedia(
    store: ActionContext<LessonState, any>,
    payload: { id: string }
  ) {
    store.commit("setPreviousExposureItemMedia", payload);
  },
};

export default actions;

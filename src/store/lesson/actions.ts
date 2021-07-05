import { preloadImage } from "@/utils/preloadImage";
import { LessonPlanModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import { Exposure, ExposureItem, ExposureItemMedia, ExposureStatus, ExposureTypeFromValue, LessonState } from "./state";

interface LessonActionsInterface<S, R> {
  setInfo(store: ActionContext<S, R>, payload: any): any;
  setExposures(
    store: ActionContext<S, R>,
    payload: {
      exposures: Exposure[];
    },
  ): any;
  setCurrentExposure(store: ActionContext<S, R>, payload: { id: string }): any;
  setCurrentExposureItemMedia(store: ActionContext<S, R>, payload: { id: string }): any;
  setExposureStatus(store: ActionContext<S, R>, payload: { id: string; status: ExposureStatus }): any;
  setIsBlackOut(store: ActionContext<S, R>, p: { IsBlackOut: boolean }): any;
}

const DEFAULT_CONTENT_BLOCK_ITEM_NAME = "Content";
const DEFAULT_TEACHING_ACTIVITY_BLOCK_ITEM_NAME = "Teaching Activity";
const DEFAULT_RESOLUTION = "1024X722";
interface LessonActions<S, R> extends ActionTree<S, R>, LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  async setInfo(store: ActionContext<LessonState, any>, payload: LessonPlanModel) {
    if (!payload) return;
    let signalture = store.rootGetters["contentSignature"];
    if (!signalture) {
      await store.dispatch("loadContentSignature", {}, { root: true });
      signalture = store.rootGetters["contentSignature"];
    }
    const exposures: Array<Exposure> = payload.contents.map(e => {
      const items: Array<ExposureItem> = e.contents.map(c => {
        const media: Array<ExposureItemMedia> = c.page.map(p => {
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

      //handle content block
      const newPage = e.page ? e.page.map(p => ({ ...p, page: [{ ...p }] })) : [];
      const contentBlockItems: Array<ExposureItem> = newPage.map(c => {
        const media: Array<ExposureItemMedia> = c.page.map(p => {
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
          name: DEFAULT_CONTENT_BLOCK_ITEM_NAME,
          media: media,
        };
      });

      //handle teaching activity block
      const newContentExposureTeachingActivity = e.contentExposureTeachingActivity
        ? e.contentExposureTeachingActivity?.map(c => ({
            ...c,
            page: [
              {
                id: c.teachingActivityId,
                resolution: DEFAULT_RESOLUTION,
                sequence: c.sequence,
                url: c.imageUrl,
              },
            ],
          }))
        : [];
      const teachingActivityBlockItems: Array<ExposureItem> = newContentExposureTeachingActivity?.map(c => {
        const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
          const url = p.url ? payload.contentStorageUrl + p.url + signalture : "";
          return {
            id: p.id, // need to confirm is contentExposureId or teachingActivity.id
            image: {
              url,
              width: parseInt(p.resolution.split("X")[0]),
              height: parseInt(p.resolution.split("X")[1]),
            },
          };
        });
        return {
          id: c.contentExposureId,
          name: c.imageName || DEFAULT_TEACHING_ACTIVITY_BLOCK_ITEM_NAME,
          media,
          textContent: c?.teachingActivity?.text,
        };
      });
      return {
        id: e.id,
        name: e.title,
        duration: e.maxDuration,
        status: e.played ? ExposureStatus.COMPLETED : ExposureStatus.DEFAULT,
        type: ExposureTypeFromValue(e.contentType.id),
        items: items,
        contentBlockItems: contentBlockItems,
        teachingActivityBlockItems: teachingActivityBlockItems,
        thumbnailURL: e.thumbnailUrl ? payload.contentStorageUrl + e.thumbnailUrl + signalture : "",
      };
    });

    const listUrl = exposures
      .map(expo => {
        const url = expo.items.map(item => {
          const urlImage = item.media.map(img => {
            return img.image.url;
          });
          return urlImage;
        });
        return url;
      })
      .flat(2);
    preloadImage(listUrl, 5000);
    store.commit("setIsBlackOut", { IsBlackOut: payload.isBlackout });
    store.commit("setExposures", { exposures: exposures });
    store.commit("setCurrentExposure", { id: payload.contentSelected });
    const exposure = payload.contents.find(e => e.id === payload.contentSelected);
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
    },
  ) {
    store.commit("setExposures", payload);
  },
  setCurrentExposure(store: ActionContext<LessonState, any>, payload: { id: string }) {
    store.commit("setCurrentExposure", payload);
  },
  setCurrentExposureItemMedia(store: ActionContext<LessonState, any>, payload: { id: string }) {

    store.commit("setCurrentExposureItemMedia", payload);
  },
  setExposureStatus(store: ActionContext<LessonState, any>, payload: { id: string; status: ExposureStatus }) {
    store.commit("setExposureStatus", payload);
  },
  setIsBlackOut(store: ActionContext<LessonState, any>, payload: { IsBlackOut: boolean }) {
    store.commit("setIsBlackOut", payload);
  },
  setPreviousExposure(store: ActionContext<LessonState, any>, payload: { id: string }) {
    store.commit("setPreviousExposure", payload);
  },
  setPreviousExposureItemMedia(store: ActionContext<LessonState, any>, payload: { id: string }) {
    store.commit("setPreviousExposureItemMedia", payload);
  },
  clearLessonData(store: ActionContext<LessonState, any>) {
    store.commit("clearLessonData");
  },
};

export default actions;

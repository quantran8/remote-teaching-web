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

interface LessonActions<S, R> extends ActionTree<S, R>, LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  async setInfo(store: ActionContext<LessonState, any>, payload: LessonPlanModel) {
    console.log("payload", payload);

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

      //handle teaching activity
      const newContentExposureTeachingActivity = e.contentExposureTeachingActivity?.map(c => ({
        ...c,
        page: [
          {
            id: c.teachingActivityId,
            resolution: "1024X722",
            sequence: c.sequence,
            url: c.imageUrl,
          },
        ],
      }));
      const teachingActivityBlockItems: Array<ExposureItem> = newContentExposureTeachingActivity?.map(c => {
        const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
          const url = p.imageUrl
            ? "123"
            : "https://glmediastorage2.blob.core.windows.net/gl-content-page/GSv4/Classroom Materials/14/Card Packs/Vocabulary cards/GSv4-U14-CM-birdhouse- page-1.png?sv=2017-04-17&sr=c&sig=ZZQZ02NSHYTwkjsU9E64D9Pda4V7THD%2Fvrde1Acvovs%3D&st=2021-06-27T03%3A32%3A28Z&se=2021-06-27T05%3A32%3A28Z&sp=r";
          return {
            id: p.id, // need to confirm is contentExposureId or teachingActivity.id
            image: {
              url,
              width: 1024, //not sent from BE => hard code
              height: 722, //not sent from BE => hard code
            },
          };
        });
        return {
          id: c.contentExposureId,
          name: c.imageName || "Teaching Activity",
          media,
        };
      });
      return {
        id: e.id,
        name: e.title,
        duration: e.maxDuration,
        status: e.played ? ExposureStatus.COMPLETED : ExposureStatus.DEFAULT,
        type: ExposureTypeFromValue(e.contentType.id),
        items: items,
        contentBlockItems: items,
        teachingActivityBlockItems: teachingActivityBlockItems,
      };
    });

    console.log("exposures", exposures);

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

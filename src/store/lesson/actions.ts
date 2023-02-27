import { ExposureContentModel, ExposureItemMediaModel, ExposureItemModel, LessonPlanModel } from "@/models";
import { LessonService } from "@/services";
import { preloadImage } from "@/utils/preloadImage";
import { ActionContext, ActionTree } from "vuex";
import {
  ContentRootTypeFromValue,
  CropMetadata,
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
    },
  ): any;
  setCurrentExposure(store: ActionContext<S, R>, payload: { id: string }): any;
  setCurrentExposureItemMedia(store: ActionContext<S, R>, payload: { id: string }): any;
  setExposureStatus(store: ActionContext<S, R>, payload: { id: string; status: ExposureStatus }): any;
  setIsBlackOut(store: ActionContext<S, R>, p: { IsBlackOut: boolean }): any;
  setClickedExposureItem(store: ActionContext<S, R>, payload: { id: string }): any;
}

const DEFAULT_CONTENT_BLOCK_ITEM_NAME = "Content";
const DEFAULT_TEACHING_ACTIVITY_BLOCK_ITEM_NAME = "Teaching Activity";
const DEFAULT_RESOLUTION = "1024X722";
const DEFAULT_ALTERNATE_MEDIA_BLOCK_ITEM_NAME = "Alternate Media";
interface LessonActions<S, R> extends ActionTree<S, R>, LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  async setInfo(store: ActionContext<LessonState, any>, payload: { lessonPlan: LessonPlanModel; isSetCurrentExposure: boolean }) {
    if (!payload) return;
    let signalture = store.rootGetters["contentSignature"];
    if (!signalture) {
      await store.dispatch("loadContentSignature", {}, { root: true });
      signalture = store.rootGetters["contentSignature"];
    }
    const exposures: Array<Exposure> = [];
    for (const e of payload.lessonPlan.contents) {
      const items: Array<ExposureItem> = e.contents.map((c: ExposureItemModel) => {
        const media: Array<ExposureItemMedia> = c.page.map((p: ExposureItemMediaModel) => {
          return {
            id: p.id,
            image: {
              url: payload.lessonPlan.contentStorageUrl + p.url + signalture,
              width: p.resolution ? parseInt(p.resolution.split("X")[0]) : parseInt(DEFAULT_RESOLUTION.split("X")[0]),
              height: p.resolution ? parseInt(p.resolution.split("X")[1]) : parseInt(DEFAULT_RESOLUTION.split("X")[1]),
            },
            teacherUseOnly: p.teacherUseOnly,
          };
        });
        return {
          id: c.id,
          name: c.title,
          media: media,
        };
      });

      //handle content block
      const newPage = e.page ? e.page.map((p: any) => ({ ...p, page: [{ ...p }] })) : [];
      const contentBlockItems: Array<ExposureItem> = newPage.map((c: any) => {
        const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
          return {
            id: p.id,
            image: {
              url: payload.lessonPlan.contentStorageUrl + p.url + signalture,
              width: p.resolution ? parseInt(p.resolution.split("X")[0]) : parseInt(DEFAULT_RESOLUTION.split("X")[0]),
              height: p.resolution ? parseInt(p.resolution.split("X")[1]) : parseInt(DEFAULT_RESOLUTION.split("X")[1]),
            },
            teacherUseOnly: p.teacherUseOnly,
          };
        });
        return {
          id: c.id,
          name: DEFAULT_CONTENT_BLOCK_ITEM_NAME,
          media: media,
          teacherUseOnly: c.teacherUseOnly,
          isClicked: false,
        };
      });

      //handle alternate media block
      const alternateMediaBlockItems: ExposureItem[][] = [];
      const newMedia = e.media ? e.media : [];
      for (const i of newMedia) {
        const alternateMedia: Array<ExposureItemMedia> = [
          {
            id: i.id,
            image: {
              url: "default",
            },
            teacherUseOnly: false,
          },
        ];
        const alternateMediaItems: Array<ExposureItem> = [
          {
            id: i.id,
            name: DEFAULT_ALTERNATE_MEDIA_BLOCK_ITEM_NAME,
            media: alternateMedia,
            mediaTypeId: i.mediaTypeId,
            teacherUseOnly: false,
          },
        ];
        const newImg = i.page ? i.page.map((p: any) => ({ ...p, page: [{ ...p }] })) : [];
        const alternateImgItems: Array<ExposureItem> = newImg.map((c: any) => {
          const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
            return {
              id: p.id,
              image: {
                url: payload.lessonPlan.contentStorageUrl + p.url + signalture,
                width: p.resolution ? parseInt(p.resolution.split("X")[0]) : parseInt(DEFAULT_RESOLUTION.split("X")[0]),
                height: p.resolution ? parseInt(p.resolution.split("X")[1]) : parseInt(DEFAULT_RESOLUTION.split("X")[1]),
              },
              teacherUseOnly: p.teacherUseOnly,
            };
          });
          return {
            id: c.id,
            name: DEFAULT_ALTERNATE_MEDIA_BLOCK_ITEM_NAME,
            media: media,
            teacherUseOnly: c.teacherUseOnly,
            mediaTypeId: undefined,
          };
        });
        const item = alternateImgItems.concat(alternateMediaItems);
        alternateMediaBlockItems.push(item);
      }

      //handle teaching activity block
      const newContentExposureTeachingActivity = e.contentExposureTeachingActivity
        ? e.contentExposureTeachingActivity?.map((c: any) => ({
            ...c,
            page: [
              {
                id: c.teachingActivityId,
                resolution: DEFAULT_RESOLUTION,
                sequence: c.sequence,
                url: c.imageUrl,
                metaData: JSON.parse(c.metaData),
              },
            ],
          }))
        : [];
      const teachingActivityBlockItems: Array<ExposureItem> = newContentExposureTeachingActivity?.map((c: any) => {
        const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
          const url = p.url ? payload.lessonPlan.contentStorageUrl + p.url + signalture : "";
          return {
            id: p.id, // need to confirm is contentExposureId or teachingActivity.id
            image: {
              url,
              width: p.resolution ? parseInt(p.resolution.split("X")[0]) : parseInt(DEFAULT_RESOLUTION.split("X")[0]),
              height: p.resolution ? parseInt(p.resolution.split("X")[1]) : parseInt(DEFAULT_RESOLUTION.split("X")[1]),
              metaData: p.metaData,
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
      const exposure = {
        id: e.id,
        name: e.title,
        duration: e.maxDuration,
        status: e.played ? ExposureStatus.COMPLETED : ExposureStatus.DEFAULT,
        type: ExposureTypeFromValue(e.contentType.id, e.contentType.name),
        items: items,
        contentBlockItems: contentBlockItems,
        teachingActivityBlockItems: teachingActivityBlockItems,
        thumbnailURL: e.thumbnailUrl ? payload.lessonPlan.contentStorageUrl + e.thumbnailUrl + signalture : "",
        contentRootType: ContentRootTypeFromValue(e.contentRootType),
        alternateMediaBlockItems: alternateMediaBlockItems,
      };
      exposures.push(exposure);
    }

    const listUrl = exposures
      .map((expo) => {
        const url = expo.items.map((item) => {
          const urlImage = item.media.map((img) => {
            return img.image.url;
          });
          return urlImage;
        });
        return url;
      })
      .flat(2);
    preloadImage(listUrl, 5000);
    store.commit("setIsBlackOut", { IsBlackOut: payload.lessonPlan.isBlackout });
    store.commit("setExposures", { exposures: exposures });
    if (payload.isSetCurrentExposure) {
      store.commit("setCurrentExposure", { id: payload.lessonPlan.contentSelected });
      const exposure = payload.lessonPlan.contents.find((e: ExposureContentModel) => e.id === payload.lessonPlan.contentSelected);
      if (exposure && exposure.pageSelected) {
        store.commit("setCurrentExposureItemMedia", {
          id: exposure.pageSelected,
        });
      }
    }
    store.commit("setPlayedTime", { time: payload.lessonPlan.playedTime });
    store.commit("setTotalTime", { time: payload.lessonPlan.totalTime });
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
  storeCacheImage(store: ActionContext<LessonState, any>, payload: { url: string; metadata: CropMetadata; base64String: string }) {
    store.commit("storeCacheImage", payload);
  },
  clearCacheImage(store: ActionContext<LessonState, any>) {
    store.commit("clearCacheImage");
  },
  setTargetsVisibleAllAction(store: ActionContext<LessonState, any>, payload) {
    store.commit("setTargetsVisibleAll", payload);
  },
  setTargetsVisibleListAction(store: ActionContext<LessonState, any>, payload) {
    store.commit("setTargetsVisibleList", payload);
  },
  setTargetsVisibleListJoinedAction(store: ActionContext<LessonState, any>, payload) {
    store.commit("setTargetsVisibleListJoined", payload);
  },
  setZoomRatio(store: ActionContext<LessonState, any>, payload) {
    store.commit("setZoomRatio", payload);
  },
  setImgCoords(store: ActionContext<LessonState, any>, payload) {
    store.commit("setImgCoords", payload);
  },
  setLessonPreviewObjects(store: ActionContext<LessonState, any>, payload) {
    store.commit("setLessonPreviewObjects", payload);
  },
  setShowPreviewCanvas(store: ActionContext<LessonState, any>, payload) {
    store.commit("setShowPreviewCanvas", payload);
  },
  setClickedExposureItem(store: ActionContext<LessonState, any>, payload) {
    store.commit("setClickedExposureItem", payload);
  },
  async getAlternateMediaUrl(store: ActionContext<LessonState, any>, payload: { token: string; id: string }) {
    const res = await LessonService.getMediaUrl(payload.token, payload.id);
    store.commit("setAlternateMediaUrl", { id: payload.id, url: res });
  },
  endCurrentContent({ commit }) {
    commit("endCurrentContent");
  },
};

export default actions;

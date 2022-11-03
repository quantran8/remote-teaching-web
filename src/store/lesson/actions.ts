import { preloadImage } from "@/utils/preloadImage";
import { LessonPlanModel } from "@/models";
import { ActionContext, ActionTree } from "vuex";
import {LessonService} from "@/services/lesson/index";
import {
  Exposure,
  ExposureItem,
  ExposureItemMedia,
  ExposureStatus,
  ExposureTypeFromValue,
  LessonState,
  ContentRootTypeFromValue,
  CropMetadata,
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
  setClickedExposureItem(store: ActionContext<S,R>, payload: { id: string }): any;
}

const DEFAULT_CONTENT_BLOCK_ITEM_NAME = "Content";
const DEFAULT_TEACHING_ACTIVITY_BLOCK_ITEM_NAME = "Teaching Activity";
const DEFAULT_RESOLUTION = "1024X722";
const DEFAULT_ALTERNATE_MEDIA_BLOCK_ITEM_NAME = "Alternate Media"
interface LessonActions<S, R> extends ActionTree<S, R>, LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  async setInfo(store: ActionContext<LessonState, any>, payload: {payload:LessonPlanModel, token:any}) {
    if (!payload.payload) return;
    let signalture = store.rootGetters["contentSignature"];
    if (!signalture) {
      await store.dispatch("loadContentSignature", {}, { root: true });
      signalture = store.rootGetters["contentSignature"];
    }
    const exposures: Array<Exposure> = payload.payload.contents.map((e) => {
      const items: Array<ExposureItem> = e.contents.map((c) => {
        const media: Array<ExposureItemMedia> = c.page.map((p) => {
          return {
            id: p.id,
            image: {
              url: payload.payload.contentStorageUrl + p.url + signalture,
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
      const newPage = e.page ? e.page.map((p:any) => ({ ...p, page: [{ ...p }] })) : [];
      const contentBlockItems: Array<ExposureItem> = newPage.map((c) => {
        const media: Array<ExposureItemMedia> = c.page.map((p:any) => {
          return {
            id: p.id,
            image: {
              url: payload.payload.contentStorageUrl + p.url + signalture,
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

		const alternateMediaBlockItems: ExposureItem[][] = []
	  //handle alternate media block
	  	const newMedia = e.media ? e.media : []
		newMedia.forEach(async (i:any) => {
			let mediaUrl:any
			const res = await fetch(`${process.env.VUE_APP_API_PREFIX}content/v1/resource/GetDownloadMediaUrl?mediaId=${i.id}`,{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${payload.token.access_token}`, 
			},
	  		}).then((response) => response.json())
			.then((data: any) => mediaUrl = data)
		  let alternateMedia: Array<ExposureItemMedia> = [{
			id: i.id,
		  	image: {
			  url: mediaUrl,
			},
		  }]
		  alternateMedia = alternateMedia.map(obj => {
			return {
			  ...obj,
			  teacherUseOnly: false,
			}
		  })
		  let alternateMediaItems: Array<ExposureItem> = [{
			id: i.id,
			name: DEFAULT_ALTERNATE_MEDIA_BLOCK_ITEM_NAME,
			media: alternateMedia,
			mediaTypeId: i.mediaTypeId,
		  }]
		  alternateMediaItems = alternateMediaItems.map(obj => {
			return {
			  ...obj,
			  teacherUseOnly: false,
			}
		  })
		  const newImg = i.page ? i.page.map((p:any) => ({ ...p, page: [{ ...p }] })) : [];
		  const alternateImgItems : Array<ExposureItem> = newImg.map((c:any) => {
		  	const media: Array<ExposureItemMedia> = c.page.map((p:any) => {
		  	  return {
		  		id: p.id,
		  		image: {
		  			url: payload.payload.contentStorageUrl + p.url + signalture,
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

		  	const item = alternateImgItems.concat(alternateMediaItems)
		    alternateMediaBlockItems.push(item)
		  
		}) 
      //handle teaching activity block
      const newContentExposureTeachingActivity = e.contentExposureTeachingActivity
        ? e.contentExposureTeachingActivity?.map((c) => ({
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
      const teachingActivityBlockItems: Array<ExposureItem> = newContentExposureTeachingActivity?.map((c) => {
        const media: Array<ExposureItemMedia> = c.page.map((p: any) => {
          const url = p.url ? payload.payload.contentStorageUrl + p.url + signalture : "";
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
      return {
        id: e.id,
        name: e.title,
        duration: e.maxDuration,
        status: e.played ? ExposureStatus.COMPLETED : ExposureStatus.DEFAULT,
        type: ExposureTypeFromValue(e.contentType.id, e.contentType.name),
        items: items,
        contentBlockItems: contentBlockItems,
        teachingActivityBlockItems: teachingActivityBlockItems,
        thumbnailURL: e.thumbnailUrl ? payload.payload.contentStorageUrl + e.thumbnailUrl + signalture : "",
        contentRootType: ContentRootTypeFromValue(e.contentRootType),
		alternateMediaBlockItems: alternateMediaBlockItems,
      };
    });

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
    store.commit("setIsBlackOut", { IsBlackOut: payload.payload.isBlackout });
    store.commit("setExposures", { exposures: exposures });
    store.commit("setCurrentExposure", { id: payload.payload.contentSelected });
    const exposure = payload.payload.contents.find((e) => e.id === payload.payload.contentSelected);
    if (exposure && exposure.pageSelected) {
      store.commit("setCurrentExposureItemMedia", {
        id: exposure.pageSelected,
      });
    }
    store.commit("setPlayedTime", { time: payload.payload.playedTime });
    store.commit("setTotalTime", { time: payload.payload.totalTime });
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
  setLessonPreviewObjects (store: ActionContext<LessonState, any>, payload){
	store.commit("setLessonPreviewObjects", payload);
  },
  setShowPreviewCanvas (store: ActionContext<LessonState, any>, payload){
	store.commit("setShowPreviewCanvas", payload);
  },
  setClickedExposureItem(store: ActionContext<LessonState, any>, payload){
	store.commit("setClickedExposureItem", payload);
  },
};

export default actions;

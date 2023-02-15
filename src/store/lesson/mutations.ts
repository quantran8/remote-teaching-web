import MediaItemLpComplete from "@/assets/images/lp-complete.png";
import MediaItemTransition from "@/assets/images/transition.png";
import { MutationTree } from "vuex";
import { CropMetadata, Exposure, ExposureItemMedia, ExposureStatus, ExposureType, LessonState, TargetsVisibleAll, TargetsVisibleList } from "./state";

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
  setClickedExposureItem(s: S, p: { id: string }): void;
}

interface LessonMutation<S> extends MutationTree<S>, LessonMutationInterface<S> {}

const mutations: LessonMutation<LessonState> = {
  setIsBlackOut(s: LessonState, p: { IsBlackOut: boolean }) {
    s.isBlackout = p.IsBlackOut;
  },
  setExposures(s: LessonState, p: { exposures: Exposure[] }) {
    s.exposures = p.exposures.map((exposure) => {
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
  setCurrentExposure(s: LessonState, p: { id: string; skipToSetCurrentExposureItemMedia?: boolean }) {
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
    if (!p.skipToSetCurrentExposureItemMedia) {
      if (
        s.currentExposure &&
        (s.currentExposure.items.length > 0 ||
          s.currentExposure.contentBlockItems.length > 0 ||
          s.currentExposure.teachingActivityBlockItems.length > 0)
      ) {
        const firstItemMediaList = [
          ...s.currentExposure.items,
          ...s.currentExposure.contentBlockItems,
          ...s.currentExposure.teachingActivityBlockItems,
        ];
        s.currentExposureItemMedia = undefined;
        const firstItem = firstItemMediaList.find((item) => item.media.length);
        if (firstItem) {
          s.currentExposureItemMedia = firstItem.media[0];
        }
      }
    }
  },
  setClickedExposureItem(s: LessonState, p: { id: string }) {
    s.currentExposure?.contentBlockItems.map((item) => (item.id === p.id ? (item.isClicked = true) : item));
  },
  setCurrentExposureItemMedia(s: LessonState, p: { id: string }) {
    if (!s.currentExposure) return;
    if (!p.id) {
      s.currentExposureItemMedia = undefined;
      return;
    }
    const combinedItems = [
      ...s.currentExposure.items,
      ...s.currentExposure.contentBlockItems,
      ...s.currentExposure.teachingActivityBlockItems,
      ...s.currentExposure.alternateMediaBlockItems.flat(),
    ];
    for (const item of combinedItems) {
      const matchItemMedia = item.media.find((m) => m.id === p.id);
      if (matchItemMedia) {
        s.currentExposureItemMedia = item.media.find((m) => m.id === p.id);
        if (s.currentExposureItemMedia) break;
      }
    }
  },
  setExposureStatus(s: LessonState, p: { id: string; status: ExposureStatus }) {
    const exposure = s.exposures.find((e) => e.id === p.id);
    if (exposure) {
      if (p.status) {
        exposure.status = p.status;
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
    const exposure = s.exposures.find((e) => e.id === p.id);
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
      s.previousExposureItemMedia = item.media.find((m) => m.id === p.id);
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
      (cacheValue) => cacheValue.url === payload.url && JSON.stringify(cacheValue.metadata) === JSON.stringify(payload.metadata),
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
    s.targetsVisibleAll = p;
  },
  setTargetsVisibleList(s: LessonState, p: TargetsVisibleList) {
    if (s.targetsVisibleList.length) {
      if (s.targetsVisibleList.some((obj) => obj.tag === p.tag)) {
        s.targetsVisibleList.map((obj: any) => {
          if (obj.tag === p.tag) {
            const index = s.targetsVisibleList.indexOf(obj);
            s.targetsVisibleList[index] = p;
          }
        });
      } else {
        s.targetsVisibleList = [...s.targetsVisibleList, p];
      }
    } else {
      s.targetsVisibleList.push(p);
    }
  },
  setTargetsVisibleListJoined(s: LessonState, p: TargetsVisibleList[]) {
    s.targetsVisibleList = p;
  },
  setZoomRatio(s: LessonState, p: number | undefined) {
    s.zoomRatio = p;
  },
  setImgCoords(s: LessonState, p: { x: number; y: number } | undefined) {
    s.imgCoords = p;
  },
  setLessonPreviewObjects(s: LessonState, p: string) {
    s.previewObjects = p;
  },
  setShowPreviewCanvas(s: LessonState, p: boolean) {
    s.isShowPreviewCanvas = p;
  },
  setAlternateMediaUrl(s: LessonState, p: { id: string; url: string }) {
    if (s.currentExposure?.alternateMediaBlockItems) {
      const alternateMedia = [...s.currentExposure?.alternateMediaBlockItems.flat()];
      const result = alternateMedia.find((item) => {
        return item.id === p.id;
      });
      if (result?.media[0]) result.media[0].image.url = p.url;
    }
  },
};

export default mutations;

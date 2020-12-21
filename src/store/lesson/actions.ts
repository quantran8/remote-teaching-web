import { ActionContext, ActionTree } from "vuex";
import { Exposure, ExposureStatus, ExposureType, LessonState } from "./state";

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
}

interface LessonActions<S, R>
  extends ActionTree<S, R>,
    LessonActionsInterface<S, R> {}

const actions: LessonActions<LessonState, any> = {
  setInfo(store: ActionContext<LessonState, any>, _: any) {
    // TODO
    const payload = {
      exposures: [
        {
          id: "1",
          name: "Troy and Lola Joy",
          type: ExposureType.SONG,
          duration: "2:00-2:30",
          status: ExposureStatus.DEFAULT,
          items: [
            {
              id: "x1",
              name: "x1",
              media: [
                {
                  id: "x11",
                  image: {
                    url: "https://picsum.photos/400/300?random=1",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "2",
          name: "The Ocean",
          type: ExposureType.POEM,
          duration: "0:45-1:00",
          status: ExposureStatus.DEFAULT,
          items: [
            {
              id: "x2",
              name: "x2",
              media: [
                {
                  id: "x21",
                  image: {
                    url: "https://picsum.photos/400/300?random=2",
                  },
                },
              ],
            },
            {
              id: "x3",
              name: "x3",
              media: [
                {
                  id: "x31",
                  image: {
                    url: "https://picsum.photos/400/300?random=3",
                  },
                },
                {
                  id: "x32",
                  image: {
                    url: "https://picsum.photos/400/300?random=4",
                  },
                },
                {
                  id: "x33",
                  image: {
                    url: "https://picsum.photos/400/300?random=5",
                  },
                },
                {
                  id: "x34",
                  image: {
                    url: "https://picsum.photos/400/300?random=6",
                  },
                },
                {
                  id: "x35",
                  image: {
                    url: "https://picsum.photos/400/300?random=7",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "3",
          name: "GrapeSEED School, We Like You",
          type: ExposureType.STORY,
          duration: "2:30-3:00",
          status: ExposureStatus.DEFAULT,
          items: [
            {
              id: "3x2",
              name: "3x2",
              media: [
                {
                  id: "3x21",
                  image: {
                    url: "https://picsum.photos/400/300?random=12",
                  },
                },
              ],
            },
            {
              id: "3x3",
              name: "3x3",
              media: [
                {
                  id: "3x31",
                  image: {
                    url: "https://picsum.photos/400/300?random=13",
                  },
                },
                {
                  id: "3x32",
                  image: {
                    url: "https://picsum.photos/400/300?random=14",
                  },
                },
                {
                  id: "3x33",
                  image: {
                    url: "https://picsum.photos/400/300?random=15",
                  },
                },
                {
                  id: "3x34",
                  image: {
                    url: "https://picsum.photos/400/300?random=16",
                  },
                },
                {
                  id: "3x35",
                  image: {
                    url: "https://picsum.photos/400/300?random=17",
                  },
                },
              ],
            },
          ],
        },
        {
          id: "4",
          name: "Transition",
          type: ExposureType.TRANSITION,
          duration: "1:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "5",
          name: "Funny Friends",
          type: ExposureType.SONG,
          duration: "2:30-3:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "6",
          name: "Phonograms",
          type: ExposureType.PHONOGRAM,
          duration: "1:30-3:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "7",
          name: "The Zoo",
          type: ExposureType.BIG_BOOK,
          duration: "1:00-1:30",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "8",
          name: "Transition",
          type: ExposureType.TRANSITION,
          duration: "1:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "9",
          name: "Opposite Direction",
          type: ExposureType.Activity,
          duration: "3:00-3:30",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "10",
          name: "What Do You See?",
          type: ExposureType.CHANT,
          duration: "2:30-3:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "11",
          name: "Transition",
          type: ExposureType.TRANSITION,
          duration: "1:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "12",
          name: "These’s a Hole!",
          type: ExposureType.SONG,
          duration: "2:30-4:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "13",
          name: "Reading",
          type: ExposureType.READING,
          duration: "3:30-4:00",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
        {
          id: "14",
          name: "Writing",
          type: ExposureType.WRITING,
          duration: "10:00-10:30",
          status: ExposureStatus.DEFAULT,
          items: [],
        },
      ],
      currentExposureId: "",
      currentExposureItemMediaId: "",
    };
    store.commit("setExposures", {
      exposures: payload.exposures,
    });
    store.commit("setCurrentExposure", {
      id: payload.currentExposureId,
    });
    store.commit("setCurrentExposureItemMedia", {
      id: payload.currentExposureItemMediaId,
    });
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
};

export default actions;

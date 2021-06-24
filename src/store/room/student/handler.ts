import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { Target } from "@/store/interactive/state";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue, InClassStatus } from "../interface";
import { ClassActionFromValue, StudentRoomState } from "./state";
import { Pointer, UserShape } from "@/store/annotation/state";
import * as medal from "@/assets/lotties/medal.json";
import * as cameraOff from "@/assets/lotties/camera_off.json";
import * as cameraOn from "@/assets/lotties/camera_on.json";
import * as soundOff from "@/assets/lotties/sound_off.json";
import * as soundOn from "@/assets/lotties/sound_on.json";
import { reactive } from "vue";

export const useStudentRoomHandler = (store: ActionContext<StudentRoomState, any>): WSEventHandler => {
  const { commit, dispatch, state, getters } = store;
  const handler = {
    onRoomInfo: async (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      await dispatch("setClassView", {
        classView: ClassViewFromValue(payload.focusTab),
      });
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("lesson/setInfo", payload.lessonPlan, { root: true });
      await dispatch("interactive/setInfo", payload.lessonPlan.interactive, {
        root: true,
      });
      await dispatch("interactive/setCurrentUserId", state.user?.id, {
        root: true,
      });
      await dispatch("annotation/setInfo", payload.lessonPlan.annotation, {
        root: true,
      });
      if (payload.studentOneToOne) {
        await dispatch(
          "studentRoom/setStudentOneId",
          { id: payload.studentOneToOne },
          {
            root: true,
          },
        );
      } else {
        await store.dispatch("studentRoom/clearStudentOneId", { id: "" }, { root: true });
      }
      commit("setWhiteboard", payload.isShowWhiteBoard);
      if (payload.teacher.disconnectTime) {
        commit("setTeacherDisconnected", true);
      }
    },
    onStudentJoinClass: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      commit("updateRaisingHand", {
        id: payload.id,
        isRaisingHand: payload.isRaisingHand,
      });
      commit("updateIsPalette", {
        id: payload.id,
        isPalette: payload.isPalette,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentLeave: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      commit("clearCircleStatus", { id: payload.id });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentDisconnected: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      commit("clearCircleStatus", { id: payload.id });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (_payload: any) => {
      //   console.log(_payload);
    },
    onStudentSendUnity: (payload: any) => {
      //   console.log(payload);
    },
    onStudentMuteAudio: (payload: StudentModel) => {
      commit("setStudentAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentMuteVideo: (payload: StudentModel) => {
      commit("setStudentVideo", {
        id: payload.id,
        enable: !payload.isMuteVideo,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherJoinClass: (payload: TeacherModel) => {
      commit("setTeacherDisconnected", false);
      commit("setTeacherStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherStreamConnect: (_payload: any) => {
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAudio: (payload: TeacherModel) => {
      commit("setTeacherAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteVideo: (payload: TeacherModel) => {
      commit("setTeacherVideo", {
        id: payload.id,
        enable: !payload.isMuteVideo,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentVideo: async (payload: StudentModel) => {
      await dispatch("setStudentVideo", {
        id: payload.id,
        enable: !payload.isMuteVideo,
      });
      if (payload.id === state.student?.id) {
        const icon = payload.isMuteVideo ? reactive({ animationData: cameraOff.default }) : reactive({ animationData: cameraOn.default });
        store.dispatch("setToast", { message: "", isPlayingSound: false, bigIcon: icon, isMedal: false }, { root: true });
      }
    },
    onTeacherMuteStudentAudio: async (payload: StudentModel) => {
      await dispatch("setStudentAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      if (payload.id === state.student?.id) {
        const icon = payload.isMuteAudio ? reactive({ animationData: soundOff.default }) : reactive({ animationData: soundOn.default });
        store.dispatch("setToast", { message: "", isPlayingSound: false, bigIcon: icon, isMedal: false }, { root: true });
      }
    },
    onTeacherMuteAllStudentVideo: async (payload: Array<StudentModel>) => {
      let status = false;
      for (const student of payload) {
        await dispatch("setStudentVideo", {
          id: student.id,
          enable: !student.isMuteVideo,
        });
        status = student.isMuteVideo;
      }
      const icon = status ? reactive({ animationData: cameraOff.default }) : reactive({ animationData: cameraOn.default });
      store.dispatch("setToast", { message: "", isPlayingSound: false, bigIcon: icon, isMedal: false }, { root: true });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: Array<StudentModel>) => {
      let status = false;
      for (const student of payload) {
        await dispatch("setStudentAudio", {
          id: student.id,
          enable: !student.isMuteAudio,
        });
        status = student.isMuteAudio;
      }
      const icon = status ? reactive({ animationData: soundOff.default }) : reactive({ animationData: soundOn.default });
      store.dispatch("setToast", { message: "", isPlayingSound: false, bigIcon: icon, isMedal: false }, { root: true });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherEndClass: async (_payload: any) => {
      await dispatch("setIsJoined", { isJoined: false });
      await dispatch("leaveRoom", {});
      commit("setError", {
        errorCode: GLErrorCode.CLASS_HAS_BEEN_ENDED,
        message: "Your class has been ended!",
      });
    },
    onTeacherDisconnect: async (payload: any) => {
      commit("setTeacherDisconnected", true);
      await store.dispatch("setToast", { message: "Please wait for your teacher" }, { root: true });
      commit("setTeacherStatus", {
        id: payload.id,
        status: InClassStatus.DEFAULT,
      });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherSetFocusTab: (payload: any) => {
      dispatch("setClassView", {
        classView: ClassViewFromValue(payload.focusTab),
      });
    },
    onTeacherUpdateGlobalAudio: async (payload: Array<string>) => {
      commit("setGlobalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateLocalAudio: (_payload: any) => {
      // do nothing
    },
    onTeacherUpdateStudentBadge: async (payload: StudentModel[]) => {
      payload.map(item => {
        commit("setStudentBadge", {
          id: item.id,
          badge: item.badge,
        });
        if (item.id === state.student?.id) {
          const icon = reactive({ animationData: medal.default });
          store.dispatch("setToast", { message: "", isPlayingSound: true, bigIcon: icon, isMedal: true }, { root: true });
        }
      });
    },
    onTeacherUpdateBlackOut: (payload: any) => {
      commit("lesson/setIsBlackOut", { IsBlackOut: payload.isBlackOut }, { root: true });
    },
    onTeacherStartLessonPlan: (payload: any) => {
      commit("lesson/setCurrentExposure", { id: payload.id }, { root: true });
    },
    onTeacherEndLessonPlan: (payload: any) => {
      commit("lesson/setExposureStatus", { id: payload.content.id, status: ExposureStatus.COMPLETED }, { root: true });
      commit("lesson/setPlayedTime", { time: payload.playedTime }, { root: true });
    },
    onTeacherSetLessonPlanItemContent: (payload: any) => {
      commit("lesson/setCurrentExposureItemMedia", { id: payload.pageSelected }, { root: true });
    },
    onStudentRaisingHand: (payload: any) => {
      //   console.log(payload);
    },
    onStudentLike: async (payload: StudentModel) => {
      //   console.log(payload);
    },
    onTeacherClearRaisingHand: (payload: any) => {
      commit("setStudentRaisingHand", {
        id: payload.id,
        raisingHand: payload.isRaisingHand,
      });
    },
    onTeacherUpdateClassAction: (payload: { action: number }) => {
      commit(
        "studentRoom/setClassAction",
        {
          action: ClassActionFromValue(payload.action),
        },
        { root: true },
      );
    },
    onTeacherDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
      const isAssigned = store.rootGetters["interactive/isAssigned"];
      if (isAssigned) {
        const message = `Please click on the board to answer.`;
        await store.dispatch("setToast", { message: message }, { root: true });
      }
    },
    onTeacherUpdateDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
    },
    onStudentAnswerSelf: async (payload: Array<Target>) => {
      await dispatch(
        "interactive/setRevealedLocalTarget",
        payload.map(s => s.id),
        { root: true },
      );
    },
    onStudentAnswerAll: async (payload: Target) => {
      await dispatch("interactive/setRevealedTarget", payload.id, {
        root: true,
      });
    },
    onStudentUpdateAnswers: async (payload: any) => {
      //   console.log(payload);
    },
    onTeacherSetPointer: async (payload: Pointer) => {
      await dispatch("annotation/setPointer", payload, {
        root: true,
      });
    },
    onTeacherUpdateAnnotationMode: async (payload: number) => {
      await dispatch(
        "annotation/setMode",
        {
          mode: payload,
        },
        {
          root: true,
        },
      );
    },
    onTeacherAddBrush: async (payload: string) => {
      await dispatch("annotation/addShape", payload, {
        root: true,
      });
    },
    onTeacherClearAllBrush: async (payload: any) => {
      await dispatch("annotation/setStudentAddShape", { studentShapes: null }, { root: true });
      await dispatch("annotation/setClearBrush", {}, { root: true });
      await dispatch("annotation/setTeacherAddShape", { teacherShapes: null }, { root: true });
      await dispatch("annotation/setStudentDrawsLine", null, { root: true });
      await dispatch("annotation/setClearOneTeacherDrawsStrokes", null, { root: true });
      await dispatch("annotation/setClearOneStudentDrawsLine", null, { root: true });
      // await dispatch("annotation/setClearOneStudentAddShape", null, { root: true });
      // await dispatch("annotation/setClearOneTeacherAddShape", null, { root: true });
    },
    onTeacherDeleteBrush: async (payload: any) => {
      await dispatch("annotation/setDeleteBrush", {}, { root: true });
    },
    onTeacherSetStickers: async (payload: any) => {
      await dispatch(
        "annotation/setStickers",
        { stickers: payload },
        {
          root: true,
        },
      );
    },
    onTeacherClearStickers: async (payload: any) => {
      await dispatch("annotation/setClearStickers", { stickers: [] }, { root: true });
    },
    onTeacherSendUnity: async (payload: any) => {
      await dispatch(
        "unity/setTeacherMessage",
        { message: payload },
        {
          root: true,
        },
      );
    },
    onTeacherSetOneToOne: async (payload: { status: boolean; id: string }) => {
      if (payload) {
        await dispatch(
          "studentRoom/setStudentOneId",
          { id: payload.id },
          {
            root: true,
          },
        );
      } else {
        await dispatch("studentRoom/clearStudentOneId", { id: "" }, { root: true });
        await dispatch("annotation/setClearOneTeacherDrawsStrokes", null, { root: true });
        await dispatch("annotation/setClearOneStudentDrawsLine", null, { root: true });
        // await dispatch("annotation/setClearOneStudentAddShape", null, { root: true });
        // await dispatch("annotation/setClearOneTeacherAddShape", null, { root: true });
      }
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherSetWhiteboard: async (payload: any) => {
      await commit("setWhiteboard", payload);
    },
    onTeacherDrawLaser: async (payload: any) => {
      await commit("setDrawLaser", payload);
    },
    onTeacherDisableAllStudentPallete: async (payload: any) => {
      await commit("studentRoom/disableAnnotationStatus", payload, { root: true });
    },
    onTeacherToggleStudentPallete: async (payload: any) => {
      await commit("studentRoom/setAnnotationStatus", payload, { root: true });
    },
    onStudentSetBrushstrokes: async (payload: Array<UserShape>) => {
      await dispatch("annotation/setStudentAddShape", { studentShapes: payload }, { root: true });
    },
    onTeacherAddShape: async (payload: any) => {
      await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload }, { root: true });
    },
    onStudentDrawsLine: async (payload: string) => {
      await dispatch("annotation/setStudentDrawsLine", payload, { root: true });
    },
  };
  return handler;
};

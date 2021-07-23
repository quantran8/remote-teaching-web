import { ClassRoomStatus, RoomModel, StudentModel, TeacherModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { Target } from "@/store/interactive/state";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue, InClassStatus } from "../interface";
import { ClassActionFromValue, StudentRoomState } from "./state";
import { Pointer, UserShape } from "@/store/annotation/state";
import * as medal from "@/assets/lotties/medal.json";
import * as cameraOff from "@/assets/icons/camera_off.png";
import * as cameraOn from "@/assets/icons/camera_on.png";
import * as soundOff from "@/assets/icons/sound_off.png";
import * as soundOn from "@/assets/icons/sound_on.png";
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
      await dispatch("annotation/setInfo", payload.annotation, {
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
      console.log("STUDENT_SIGNALR::STUDENT_DISCONNECT => ", payload.id);
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
        const icon = payload.isMuteVideo ? cameraOff : cameraOn;
        await store.dispatch("setToast", { message: "", isPlayingSound: false, icon: icon, isMedal: false }, { root: true });
      }
    },
    onTeacherMuteStudentAudio: async (payload: StudentModel) => {
      await dispatch("setStudentAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      if (payload.id === state.student?.id) {
        const icon = payload.isMuteAudio ? soundOff : soundOn;
        await store.dispatch("setToast", { message: "", isPlayingSound: false, icon: icon, isMedal: false }, { root: true });
      }
    },
    onTeacherMuteAllStudentVideo: async (payload: Array<StudentModel>) => {
      let status = false;
      for (const student of payload) {
        await dispatch("setStudentVideo", {
          id: student.id,
          enable: !student.isMuteVideo,
        });
        if (student.id === state.student?.id) {
          status = student.isMuteVideo;
        }
      }
      const icon = status ? cameraOff : cameraOn;
      await store.dispatch("setToast", { message: "", isPlayingSound: false, icon: icon, isMedal: false }, { root: true });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: Array<StudentModel>) => {
      let status = false;
      for (const student of payload) {
        await dispatch("setStudentAudio", {
          id: student.id,
          enable: !student.isMuteAudio,
        });
        if (student.id === state.student?.id) {
          status = student.isMuteAudio;
        }
      }
      const icon = status ? soundOff : soundOn;
      await store.dispatch("setToast", { message: "", isPlayingSound: false, icon: icon, isMedal: false }, { root: true });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherDisableAllStudentPallete: async (payload: any) => {
      await commit("disableAnnotationStatus", payload, { root: false });
    },
    onTeacherToggleStudentPallete: async (payload: any) => {
      await commit("studentRoom/setAnnotationStatus", payload, { root: true });
    },
    onTeacherEndClass: async (_payload: any) => {
      await store.dispatch("setClassRoomStatus", { status: ClassRoomStatus.InDashBoard }, { root: true });
      await dispatch("leaveRoom", {});
      commit("setApiStatus", {
        code: GLErrorCode.CLASS_HAS_BEEN_ENDED,
        message: "Your class has been ended!",
      });
    },
    onTeacherDisconnect: async (payload: any) => {
      console.log("STUDENT_SIGNALR::TEACHER_DISCONNECT => ", payload.id);
      commit("setTeacherDisconnected", true);
      await store.dispatch("setToast", { message: "Please wait for your teacher" }, { root: true });
      commit("setTeacherStatus", {
        id: payload.id,
        status: InClassStatus.DEFAULT,
      });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherSetFocusTab: (payload: number) => {
      dispatch("setClassView", {
        classView: ClassViewFromValue(payload),
      });
      commit("setWhiteboard", { isShowWhiteBoard: false });
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
      commit("lesson/setCurrentExposure", { id: payload }, { root: true });
      commit("setWhiteboard", { isShowWhiteBoard: false });
    },
    onTeacherEndLessonPlan: (payload: any) => {
      commit("lesson/setExposureStatus", { id: payload.ContentId, status: ExposureStatus.COMPLETED }, { root: true });
      if (payload.playedTime) commit("lesson/setPlayedTime", { time: payload.playedTime }, { root: true });
    },
    onTeacherSetLessonPlanItemContent: (payload: any) => {
      commit("lesson/setCurrentExposureItemMedia", { id: payload }, { root: true });
      commit("setWhiteboard", { isShowWhiteBoard: false });
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
    onTeacherSetOneToOne: async (payload: {
      status: boolean;
      id: string;
      drawing: any;
      student: any;
      focusTab: any;
      isShowWhiteBoard: boolean;
      exposureSelected: string;
      itemContentSelected: string;
    }) => {
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
      }
      await dispatch("updateAudioAndVideoFeed", {});
      if (payload.id) {
        // process in one one
        await dispatch("annotation/setOneTeacherStrokes", payload.drawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setOneStudentStrokes", payload.drawing.studentBrushstrokes, { root: true });
        await dispatch("setClassView", { classView: ClassViewFromValue(payload.focusTab) });
      } else {
        await dispatch("setClassView", { classView: ClassViewFromValue(payload.focusTab) });
        await commit("lesson/setCurrentExposure", { id: payload.exposureSelected }, { root: true });
        await commit("lesson/setCurrentExposureItemMedia", { id: payload.itemContentSelected }, { root: true });
        await commit("updateIsPalette", {
          id: payload.student.id,
          isPalette: payload.student.isPalette,
        });
        await commit("setWhiteboard", payload.isShowWhiteBoard);
        await dispatch("annotation/setTeacherBrushes", payload.drawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentStrokes", payload.drawing.studentBrushstrokes, { root: true });
      }
    },
    onTeacherSetWhiteboard: async (payload: any) => {
      await commit("setWhiteboard", payload);
    },
    onTeacherDrawLaser: async (payload: any) => {
      await commit("setDrawLaser", payload);
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

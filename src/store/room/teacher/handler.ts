import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue, InClassStatus } from "../interface";
import { ClassActionFromValue } from "../student/state";
import { TeacherRoomState } from "./state";
import { UserShape } from "@/store/annotation/state";
import { notification } from "ant-design-vue";

export const useTeacherRoomWSHandler = ({ commit, dispatch, state }: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onStudentJoinClass: async (payload: StudentModel) => {
      commit("studentJoinned", { id: payload.id });
      commit("updateMediaStatus", payload);
      commit("updateRaisingHand", {
        id: payload.id,
        isRaisingHand: payload.isRaisingHand,
      });
      commit("updateIsPalette", {
        id: payload.id,
        isPalette: payload.isPalette,
      });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (payload: any) => {
      //   console.log(payload);
    },
    onStudentMuteAudio: async (payload: StudentModel) => {
      commit("setStudentAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentMuteVideo: async (payload: StudentModel) => {
      commit("setStudentVideo", {
        id: payload.id,
        enable: !payload.isMuteVideo,
      });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentLeave: async (payload: StudentModel) => {
      commit("studentLeftClass", { id: payload.id });
      await dispatch("updateAudioAndVideoFeed", {});
      const student = state.students.find(student => student.id === payload.id);
      if (student && student.englishName) {
        notification.warn({
          message: `${student.englishName} left the class.`,
        });
      }
    },
    onStudentDisconnected: async (payload: StudentModel) => {
      console.log("TEACHER_SIGNALR::STUDENT_DISCONNECT => ", payload.id);
      const student = state.students.find(student => student.id === payload.id);
      if (student?.status === InClassStatus.LEFT) return;
      commit("studentDisconnectClass", { id: payload.id });
      await dispatch("updateAudioAndVideoFeed", {});
      if (student && student.englishName) {
        notification.warn({
          message: `${student.englishName} has lost connection.`,
        });
      }
    },
    onStudentSendUnity: async (payload: any) => {
      await dispatch(
        "unity/setStudentMessage",
        { message: payload },
        {
          root: true,
        },
      );
    },
    onTeacherJoinClass: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherStreamConnect: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherMuteAudio: (payload: TeacherModel) => {
      //   console.log(payload);
    },
    onTeacherMuteVideo: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherMuteStudentVideo: async (payload: any) => {
      //   await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentAudio: async (payload: any) => {
      //   await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentVideo: async (payload: any) => {
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: any) => {
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherDisableAllStudentPallete: async (payload: any) => {
      await commit("teacherRoom/disableAnnotationStatus", payload, { root: true });
    },
    onTeacherToggleStudentPallete: async (payload: any) => {
      await commit("teacherRoom/setAnnotationStatus", payload, { root: true });
    },
    onTeacherEndClass: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherDisconnect: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherSetFocusTab: (payload: number) => {
      commit("setClassView", {
        classView: ClassViewFromValue(payload),
      });
    },
    onTeacherUpdateGlobalAudio: async (payload: Array<string>) => {
      commit("setGlobalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateLocalAudio: async (payload: Array<string>) => {
      commit("setLocalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentBadge: (payload: StudentModel[]) => {
      payload.map(item => {
        commit("setStudentBadge", {
          id: item.id,
          badge: item.badge,
        });
      });
    },
    onTeacherUpdateBlackOut: (payload: any) => {
      commit("lesson/setIsBlackOut", { IsBlackOut: payload.isBlackOut }, { root: true });
    },
    onTeacherStartLessonPlan: (payload: any) => {
      commit("lesson/setCurrentExposure", { id: payload }, { root: true });
    },
    onTeacherEndLessonPlan: (payload: any) => {
      if (payload.playedTime) {
        commit("lesson/setExposureStatus", { id: payload.contentId, status: ExposureStatus.COMPLETED }, { root: true });
        commit("lesson/setPlayedTime", { time: payload.playedTime }, { root: true });
      } else {
        commit("lesson/setExposureStatus", { id: payload.contentId }, { root: true });
      }
    },
    onTeacherSetLessonPlanItemContent: (payload: any) => {
      commit("lesson/setCurrentExposureItemMedia", { id: payload }, { root: true });
    },
    onStudentRaisingHand: async (student: StudentModel) => {
      const payload = { id: student.id, raisingHand: student.isRaisingHand };
      await dispatch("teacherRoom/studentRaisingHand", payload, { root: true });
    },
    onStudentLike: async (payload: StudentModel) => {
      const notification = {
        id: "" + Date.now,
        message: `${payload.englishName} liked the content`,
        duration: 5000,
      };
      await dispatch("notification/addNotification", notification, {
        root: true,
      });
    },
    onTeacherClearRaisingHand: async (student: StudentModel) => {
      const payload = { id: student.id, raisingHand: student.isRaisingHand };
      await dispatch("teacherRoom/studentRaisingHand", payload, { root: true });
    },
    onTeacherUpdateClassAction: (payload: { action: number }) => {
      commit(
        "teacherRoom/setClassAction",
        {
          action: ClassActionFromValue(payload.action),
        },
        { root: true },
      );
    },
    onTeacherDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
    },
    onTeacherUpdateDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
    },
    onStudentAnswerSelf: (payload: any) => {
      //   console.log(payload);
    },
    onStudentAnswerAll: async (payload: any) => {
      await dispatch("interactive/setRevealedTarget", payload.id, {
        root: true,
      });
    },
    onStudentUpdateAnswers: async (payload: any) => {
      await dispatch("interactive/setUpdateStudentsAnswerForTeacher", payload, {
        root: true,
      });
    },
    onTeacherSetPointer: async (payload: any) => {
      //   console.log(payload);
    },
    onTeacherUpdateAnnotationMode: async (payload: any) => {
      //   console.log(payload);
    },
    onTeacherAddBrush: async (payload: any) => {
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
    onTeacherDeleteBrush(payload: any) {
      //   console.log(payload);
    },
    onTeacherSetStickers(payload: any) {
      //   console.log(payload);
    },
    onTeacherClearStickers(payload: any) {
      //   console.log(payload);
    },
    onTeacherSendUnity(payload: any) {
      //   console.log(payload);
    },
    onTeacherSetOneToOne: async (payload: any) => {
      if (payload) {
        await dispatch(
          "teacherRoom/setStudentOneId",
          { id: payload.id },
          {
            root: true,
          },
        );
      } else {
        await dispatch("teacherRoom/clearStudentOneId", { id: "" }, { root: true });
      }
      await dispatch("updateAudioAndVideoFeed", {});
      if (payload.id) {
        // process in one one
        await dispatch("annotation/setOneTeacherStrokes", payload.drawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setOneStudentStrokes", payload.drawing.studentBrushstrokes, { root: true });
      } else {
        await commit("setClassView", { classView: ClassViewFromValue(payload.focusTab) });
        await commit("lesson/endCurrentContent", {}, { root: true });
        await commit("lesson/setCurrentExposure", { id: payload.exposureSelected }, { root: true });
        await commit("lesson/setCurrentExposureItemMedia", { id: payload.itemContentSelected }, { root: true });
        await dispatch(
          "teacherRoom/toggleAnnotation",
          {
            studentId: payload.student.id,
            isEnable: payload.student.isPalette,
          },
          { root: true },
        );
        await commit("teacherRoom/setWhiteboard", payload.isShowWhiteBoard, { root: true });
        await dispatch("annotation/setTeacherBrushes", payload.drawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentStrokes", payload.drawing.studentBrushstrokes, { root: true });
      }
    },
    onTeacherSetWhiteboard: async (payload: RoomModel) => {
      commit("teacherRoom/setWhiteboard", payload, { root: true });
    },
    onTeacherDrawLaser: (payload: any) => {
      //   console.log(payload);
    },
    onStudentSetBrushstrokes: async (payload: any) => {
      await dispatch("annotation/setStudentAddShape", { studentShapes: payload }, { root: true });
    },
    onTeacherAddShape: async (payload: Array<UserShape>) => {
      await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload }, { root: true });
    },
    onStudentDrawsLine: async (payload: string) => {
      await dispatch("annotation/setStudentDrawsLine", payload, {
        root: true,
      });
    },
  };
  return handler;
};

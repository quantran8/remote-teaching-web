import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue, InClassStatus } from "../interface";
import { ClassActionFromValue } from "../student/state";
import { TeacherRoomState } from "./state";
import { UserShape } from "@/store/annotation/state";

export const useTeacherRoomWSHandler = ({ commit, dispatch, state }: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onRoomInfo: async (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("lesson/setInfo", payload.lessonPlan, { root: true });
      await dispatch("interactive/setInfo", payload.lessonPlan.interactive, {
        root: true,
      });
      if (payload.studentOneToOne) {
        await dispatch(
          "teacherRoom/setStudentOneId",
          { id: payload.studentOneToOne },
          {
            root: true,
          },
        );
      } else {
        await dispatch("teacherRoom/clearStudentOneId", { id: "" }, { root: true });
      }
    },
    onStudentJoinClass: async (payload: StudentModel) => {
      commit("studentJoinned", { id: payload.id });
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
        const message = `${student.englishName} left the class.`;
        await dispatch("setToast", { message: message }, { root: true });
      }
    },
    onStudentDisconnected: async (payload: StudentModel) => {
      const student = state.students.find(student => student.id === payload.id);
      if (student?.status === InClassStatus.LEFT) return;
      commit("studentDisconnectClass", { id: payload.id });
      await dispatch("updateAudioAndVideoFeed", {});
      if (student && student.englishName) {
        const message = `${student.englishName} has lost connection.`;
        await dispatch("setToast", { message: message }, { root: true });
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
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentAudio: async (payload: any) => {
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentVideo: async (payload: any) => {
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: any) => {
      //   console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherEndClass: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherDisconnect: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherSetFocusTab: (payload: RoomModel) => {
      commit("setClassView", {
        classView: ClassViewFromValue(payload.focusTab),
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
      commit("lesson/setCurrentExposure", { id: payload.id }, { root: true });
    },
    onTeacherEndLessonPlan: (payload: any) => {
      commit("lesson/setExposureStatus", { id: payload.content.id, status: ExposureStatus.COMPLETED }, { root: true });
      commit("lesson/setPlayedTime", { time: payload.playedTime }, { root: true });
    },
    onTeacherSetLessonPlanItemContent: (payload: any) => {
      commit("lesson/setCurrentExposureItemMedia", { id: payload.pageSelected }, { root: true });
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
      //   console.log(payload);
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
        await dispatch("annotation/setClearOneTeacherDrawsStrokes", null, { root: true });
        await dispatch("annotation/setClearOneStudentDrawsLine", null, { root: true });
        // await dispatch("annotation/setClearOneStudentAddShape", null, { root: true });
        // await dispatch("annotation/setClearOneTeacherAddShape", null, { root: true });
      }
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherSetWhiteboard: (payload: RoomModel) => {
      //   console.log(payload);
    },
    onTeacherDrawLaser: (payload: any) => {
      //   console.log(payload);
    },
    onTeacherDisableAllStudentPallete: async (payload: any) => {
      await commit("teacherRoom/disableAnnotationStatus", payload, { root: true });
    },
    onTeacherToggleStudentPallete: async (payload: any) => {
      await commit("teacherRoom/setAnnotationStatus", payload, { root: true });
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

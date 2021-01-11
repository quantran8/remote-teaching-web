import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue } from "../interface";
import { ClassActionFromValue } from "../student/state";
import { TeacherRoomState } from "./state";

export const useTeacherRoomWSHandler = ({
  commit,
  dispatch,
}: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onRoomInfo: async (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      await dispatch("updateAudioAndVideoFeed", {});
      await dispatch("lesson/setInfo", payload.lessonPlan, { root: true });
      await dispatch("interactive/setInfo", payload.lessonPlan.interactive, {
        root: true,
      });
    },
    onStudentJoinClass: async (payload: StudentModel) => {
      commit("studentJoinned", { id: payload.id });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (payload: any) => {
      console.log(payload);
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
    },
    onStudentDisconnected: async (payload: StudentModel) => {
      commit("studentLeftClass", { id: payload.id });
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherJoinClass: (payload: any) => {
      console.log(payload);
    },
    onTeacherStreamConnect: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteAudio: (payload: TeacherModel) => {
      console.log(payload);
    },
    onTeacherMuteVideo: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteStudentVideo: async (payload: any) => {
      console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentAudio: async (payload: any) => {
      console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentVideo: async (payload: any) => {
      console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: any) => {
      console.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherEndClass: (payload: any) => {
      console.log(payload);
    },
    onTeacherDisconnect: (payload: any) => {
      console.log(payload);
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
    onTeacherUpdateStudentBadge: (payload: StudentModel) => {
      commit("setStudentBadge", {
        id: payload.id,
        badge: payload.badge,
      });
    },
    onTeacherUpdateBlackOut: (payload: any) => {
      commit(
        "lesson/setIsBlackOut",
        { IsBlackOut: payload.isBlackOut },
        { root: true }
      );
    },
    onTeacherStartLessonPlan: (payload: any) => {
      commit("lesson/setCurrentExposure", { id: payload.id }, { root: true });
    },
    onTeacherEndLessonPlan: (payload: any) => {
      commit(
        "lesson/setExposureStatus",
        { id: payload.content.id, status: ExposureStatus.COMPLETED },
        { root: true }
      );
      commit(
        "lesson/setPlayedTime",
        { time: payload.playedTime },
        { root: true }
      );
    },
    onTeacherSetLessonPlanItemContent: (payload: any) => {
      commit(
        "lesson/setCurrentExposureItemMedia",
        { id: payload.pageSelected },
        { root: true }
      );
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
        { root: true }
      );
    },
    onTeacherDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
    },
    onTeacherUpdateDesignateTarget: async (payload: any) => {
      await dispatch("interactive/setInfo", payload, { root: true });
    },
    onStudentAnswerSelf :(payload: any) => {
      console.log(payload);
    },
    onStudentAnswerAll : async (payload: any) => {
      console.log(payload);
      await dispatch("interactive/setRevealedTarget", payload.id, {
        root: true,
      });
    },
    onStudentUpdateAnswers : async (payload: any) => {
      console.log(payload);
      await dispatch("interactive/setUpdateStudentsAnswerForTeacher", payload, {root: true})
    }
  };
  return handler;
};

import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue } from "../interface";
import { TeacherRoomState } from "./state";

export const useTeacherRoomWSHandler = ({
  commit,
  dispatch,
  state,
}: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onRoomInfo: async (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      await dispatch("updateAudioAndVideoFeed", {});
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
    onTeacherUpdateGlobalStudentAudio: async (payload: Array<string>) => {
      commit("setGlobalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentAudio: async (payload: Array<string>) => {
      commit("setLocalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentBadge: (payload: StudentModel) => {
      commit("setStudentBadge", {
        id: payload.id,
        badge: payload.badge,
      });
    },
  };
  return handler;
};

import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { TeacherRoomState } from "./state";

export const useTeacherRoomWSHandler = ({
  commit,
  dispatch,
  state,
}: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onRoomInfo: (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentJoinClass: (payload: StudentModel) => {
      commit("studentJoinned", { studentId: payload.id });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (payload: any) => {
      console.log(payload);
    },
    onStudentMuteAudio: (payload: StudentModel) => {
      commit("setStudentAudio", {
        studentId: payload.id,
        audioEnabled: !payload.isMuteAudio,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentMuteVideo: (payload: StudentModel) => {
      commit("setStudentVideo", {
        studentId: payload.id,
        videoEnabled: !payload.isMuteVideo,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentLeave: (payload: StudentModel) => {
      commit("studentLeftClass", { studentId: payload.id });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentDisconnected: (payload: StudentModel) => {
      commit("studentLeftClass", { studentId: payload.id });
      dispatch("updateAudioAndVideoFeed", {});
    },

    onTeacherJoinClass: (payload: any) => {
      console.log(payload);
    },
    onTeacherStreamConnect: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteAudio: (payload: TeacherModel) => {
      state.manager?.setMicrophone({
        enable: !payload.isMuteAudio,
      });
    },
    onTeacherMuteVideo: (payload: any) => {
      state.manager?.setCamera({
        enable: !payload.isMuteVideo,
      });
    },
    onTeacherMuteStudentVideo: (payload: any) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentAudio: (payload: any) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentVideo: (payload: any) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: (payload: any) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherEndClass: (payload: any) => {
      console.log(payload);
    },
    onTeacherDisconnect: (payload: any) => {
      console.log(payload);
    },
    onTeacherSetFocusTab: (payload: any) => {
      console.log(payload);
    },
    onTeacherUpdateGlobalStudentAudio: (payload: any) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentAudio: (payload: Array<string>) => {
      console.log(payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentBadge: (payload: any) => {
      console.log(payload);
    },
  };
  return handler;
};

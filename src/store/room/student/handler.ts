import { StudentModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { StudentRoomState } from "./state";

export const useStudentRoomHandler = (
  store: ActionContext<StudentRoomState, any>
): WSEventHandler => {
  const { commit, dispatch, state } = store;
  const handler = {
    onRoomInfo: (payload: any) => {
      commit("setRoomInfo", payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentJoinClass: (_payload: any) => {
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentLeave: (_payload: any) => {
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentDisconnected: (_payload: any) => {
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (payload: any) => {
      console.log(payload);
    },
    onStudentMuteAudio: (payload: StudentModel) => {
      console.log(payload);
    },
    onStudentMuteVideo: (payload: StudentModel) => {
      console.log(payload);
    },
    onTeacherJoinClass: (payload: any) => {
      console.log(payload);
    },
    onTeacherStreamConnect: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteAudio: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteVideo: (payload: any) => {
      console.log(payload);
    },
    onTeacherMuteStudentVideo: (payload: StudentModel) => {
      commit("setStudentVideo", {
        studentId: payload.id,
        videoEnabled: !payload.isMuteVideo,
      });
      const message = `Your video has been turn ${
        payload.isMuteVideo ? "off" : "on"
      } by your teacher!`;
      store.dispatch("setToast", message, { root: true });
    },
    onTeacherMuteStudentAudio: (payload: StudentModel) => {
      commit("setStudentAudio", {
        studentId: payload.id,
        audioEnabled: !payload.isMuteAudio,
      });
      const message = `Your microphone has been turn ${
        payload.isMuteAudio ? "off" : "on"
      } by your teacher!`;
      store.dispatch("setToast", message, { root: true });
    },
    onTeacherMuteAllStudentVideo: (payload: Array<StudentModel>) => {
      for (const student of payload) {
        commit("setStudentVideo", {
          studentId: student.id,
          videoEnabled: !student.isMuteVideo,
        });
      }
    },
    onTeacherMuteAllStudentAudio: (payload: Array<StudentModel>) => {
      for (const student of payload) {
        commit("setStudentAudio", {
          studentId: student.id,
          audioEnabled: !student.isMuteAudio,
        });
      }
    },
    onTeacherEndClass: async (_payload: any) => {
      await dispatch("leaveRoom", {});
      commit("setError", {
        errorCode: GLErrorCode.CLASS_HAS_BEEN_ENDED,
        message: "Your class has been ended!",
      });
    },
    onTeacherDisconnect: (payload: any) => {
      console.log("onTeacherDisconnect", payload);
    },
    onTeacherSetFocusTab: (payload: any) => {
      console.log(payload);
    },
    onTeacherUpdateGlobalStudentAudio: async (payload: Array<string>) => {
      commit("setGlobalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateStudentAudio: (payload: any) => {
      console.log(payload);
    },
    onTeacherUpdateStudentBadge: (payload: StudentModel) => {
      commit("setStudentBadge", {
        studentId: payload.id,
        badge: payload.badge,
      });
      if (payload.id === state.student?.id) {
        const message = `Congratulations! You got ${payload.badge} badge${
          payload.badge > 1 ? "s" : ""
        } from your teacher!`;
        store.dispatch("setToast", message, { root: true });
      }
    },
  };
  return handler;
};

import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { GLErrorCode } from "@/models/error.model";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { InClassStatus } from "../interface";
import { StudentRoomState } from "./state";

export const useStudentRoomHandler = (
  store: ActionContext<StudentRoomState, any>
): WSEventHandler => {
  const { commit, dispatch, state } = store;
  const handler = {
    onRoomInfo: (payload: RoomModel) => {
      commit("setRoomInfo", payload);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentJoinClass: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentLeave: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentDisconnected: (payload: StudentModel) => {
      commit("setStudentStatus", {
        id: payload.id,
        status: payload.connectionStatus,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onStudentStreamConnect: (_payload: any) => {
      console.log(_payload);
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
        const message = `Your video has been turn ${
          payload.isMuteVideo ? "off" : "on"
        } by your teacher!`;
        store.dispatch("setToast", message, { root: true });
      }
    },
    onTeacherMuteStudentAudio: async (payload: StudentModel) => {
      await dispatch("setStudentAudio", {
        id: payload.id,
        enable: !payload.isMuteAudio,
      });
      if (payload.id === state.student?.id) {
        const message = `Your microphone has been turn ${
          payload.isMuteAudio ? "off" : "on"
        } by your teacher!`;
        store.dispatch("setToast", message, { root: true });
      }
    },
    onTeacherMuteAllStudentVideo: async (payload: Array<StudentModel>) => {
      for (const student of payload) {
        await dispatch("setStudentVideo", {
          id: student.id,
          enable: !student.isMuteVideo,
        });
      }
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: Array<StudentModel>) => {
      for (const student of payload) {
        await dispatch("setStudentAudio", {
          id: student.id,
          enable: !student.isMuteAudio,
        });
      }
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherEndClass: async (_payload: any) => {
      await dispatch("leaveRoom", {});
      commit("setError", {
        errorCode: GLErrorCode.CLASS_HAS_BEEN_ENDED,
        message: "Your class has been ended!",
      });
    },
    onTeacherDisconnect: (payload: any) => {
      commit("setTeacherStatus", {
        id: payload.id,
        status: InClassStatus.DEFAULT,
      });
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherSetFocusTab: (payload: any) => {
      console.log(payload);
    },
    onTeacherUpdateGlobalAudio: async (payload: Array<string>) => {
      commit("setGlobalAudios", payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherUpdateLocalAudio: (_payload: any) => {
      // do nothing
    },
    onTeacherUpdateStudentBadge: (payload: StudentModel) => {
      commit("setStudentBadge", {
        id: payload.id,
        badge: payload.badge,
      });
      if (payload.id === state.student?.id) {
        const message = `Congratulations! You got 1 more badge from your teacher!`;
        store.dispatch("setToast", message, { root: true });
      }
    },
  };
  return handler;
};

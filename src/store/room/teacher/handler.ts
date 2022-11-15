import { RoomModel, StudentModel, TeacherModel } from "@/models";
import { ExposureStatus } from "@/store/lesson/state";
import { WSEventHandler } from "@/ws";
import { ActionContext } from "vuex";
import { ClassViewFromValue, InClassStatus, StudentCaptureStatus } from "../interface";
import { ClassActionFromValue } from "../student/state";
import { TeacherRoomState } from "./state";
import { UserShape } from "@/store/annotation/state";
import { notification } from "ant-design-vue";
import { Logger } from "@/utils/logger";

export const useTeacherRoomWSHandler = ({ commit, dispatch, state }: ActionContext<TeacherRoomState, any>): WSEventHandler => {
  const handler = {
    onStudentJoinClass: async (payload: StudentModel) => {
      commit("studentJoinned", { id: payload.id });
      const student = state.students.find((student) => student.id === payload.id);
      if (student && student.englishName) {
        notification.warn({
          message: `${student.englishName} has joined the class.`,
        });
      }
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
      //   Logger.log(payload);
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
      const student = state.students.find((student) => student.id === payload.id);
      if (student && student.englishName) {
        notification.warn({
          message: `${student.englishName} has left the class.`,
        });
      }
    },
    onStudentDisconnected: async (payload: StudentModel) => {
      if (payload) {
        Logger.log("TEACHER_SIGNALR::STUDENT_DISCONNECT => ", payload.id);
        const student = state.students.find((student) => student.id === payload.id);
        if (student?.status === InClassStatus.LEFT) return;
        commit("studentDisconnectClass", { id: payload.id });
        await dispatch("updateAudioAndVideoFeed", {});
        if (student && student.englishName) {
          notification.warn({
            message: `It seems ${student.englishName} had some connectivity issue due to which had to drop out from the class`,
          });
        }
        await state.manager?.rerenderParticipantsVideo();
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
      const userId = state.user?.id;
      commit("setTeacherVideo", { id: userId, enable: !payload.isMuteVideo });
      commit("setTeacherAudio", { id: userId, enable: !payload.isMuteAudio });
    },
    onTeacherStreamConnect: (payload: any) => {
      //   Logger.log(payload);
    },
    onTeacherMuteAudio: (payload: TeacherModel) => {
      //   Logger.log(payload);
    },
    onTeacherMuteVideo: (payload: any) => {
      //   Logger.log(payload);
    },
    onTeacherMuteStudentVideo: async (payload: any) => {
      //   await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteStudentAudio: async (payload: any) => {
      //   await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentVideo: async (payload: any) => {
      //   Logger.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherMuteAllStudentAudio: async (payload: any) => {
      //   Logger.log(payload);
      await dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherDisableAllStudentPallete: async (payload: any) => {
      await commit("teacherRoom/disableAnnotationStatus", payload, { root: true });
    },
    onTeacherToggleStudentPallete: async (payload: any) => {
      await commit("teacherRoom/setAnnotationStatus", payload, { root: true });
    },
    onTeacherEndClass: (payload: any) => {
      //   Logger.log(payload);
    },
    onTeacherDisconnect: (payload: any) => {
      //   Logger.log(payload);
    },
    onTeacherSetTeachingMode: (payload: number) => {
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
      payload.map((item) => {
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
      //   Logger.log(payload);
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
      //   Logger.log(payload);
    },
    onTeacherUpdateAnnotationMode: async (payload: any) => {
      //   Logger.log(payload);
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
      //   Logger.log(payload);
    },
    onTeacherSetStickers(payload: any) {
      //   Logger.log(payload);
    },
    onTeacherClearStickers(payload: any) {
      //   Logger.log(payload);
    },
    onTeacherSendUnity(payload: any) {
      //   Logger.log(payload);
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
      await dispatch("setTeacherMessageVersion", payload.messageVersion, { root: true });
      //console.log(`Get 1-1 message with version ${payload.messageVersion}`);
      if (payload.id) {
        // process in one one
        await dispatch("annotation/setOneTeacherStrokes", payload.drawing.brushstrokes, { root: true });
        await dispatch("annotation/setTeacherAddShape", { teacherShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setStudentAddShape", { studentShapes: payload.drawing.shapes }, { root: true });
        await dispatch("annotation/setOneStudentStrokes", payload.drawing.studentBrushstrokes, { root: true });
      } else {
        await commit("setClassView", { classView: ClassViewFromValue(payload.teachingMode) });
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
        await dispatch("annotation/setFabricsInDrawing", payload.drawing.fabrics, { root: true });
      }
    },
    onTeacherSetWhiteboard: async (payload: RoomModel) => {
      commit("teacherRoom/setWhiteboard", payload, { root: true });
    },
    onTeacherSetMediaState: async (payload: any) => {
      commit("teacherRoom/setMediaState", payload, { root: true });
    },
    onTeacherSetCurrentTimeMedia: async (payload: any) => {
      commit("teacherRoom/setCurrentTimeMedia", payload, { root: true });
    },
    onTeacherDrawLaser: (payload: any) => {
      //   Logger.log(payload);
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
    onTeacherCreateFabricObject: (payload: any) => {
      Logger.info("Fabric:create object");
    },
    onTeacherModifyFabricObject: (payload: any) => {
      Logger.info("Fabric:modify object");
    },
    onToggleShape: async (payload: any) => {
      await dispatch("lesson/setTargetsVisibleListAction", payload, { root: true });
    },
    onToggleAllShapes: (payload: any) => {
      Logger.info("Toggle all targets");
    },
    onTeacherUpdateSessionLessonAndUnit: async (payload: any) => {
      Logger.info("Teacher update lesson and unit");
    },
    onRoomInfo: (payload: RoomModel) => {
      const { teacher, students } = payload;
      const users = {
        teacher: teacher,
        students: students,
      };
      commit("setRoomUsersInfo", users);
      dispatch("updateAudioAndVideoFeed", {});
    },
    onTeacherZoomSlide: (p: any) => {
      //
    },
    onTeacherMoveZoomedSlide: (p: any) => {
      //
    },
    onTeacherResetZoom: (p: any) => {
      //
    },
    onTeacherDrawPencil: (p: string) => {
      //
    },
    onTeacherSendRequestCaptureImage: (p: string) => {
      //
    },
    onStudentSendCapturedImageStatus: (p: StudentCaptureStatus) => {
      commit("setStudentsCaptureDone", p);
      if (p.isUploaded) {
        commit("setStudentImageCapturedCount", { id: p.studentId, imageCapturedCount: p.imageCapturedCount });
      }
    },
  };
  return handler;
};

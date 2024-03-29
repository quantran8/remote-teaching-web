import { StudentRoomManager } from "@/manager/room/student.manager";
import { ClassModel, ClassRoomModel, RoomModel } from "@/models";
import { GLApiStatus, GLError } from "@/models/error.model";
import { UserModel } from "@/models/user.model";
import { GetterTree } from "vuex";
import { ClassView, HelperState, StudentState, TeacherState } from "../interface";
import { ClassAction, StudentRoomState } from "./state";

const getters: GetterTree<StudentRoomState, any> = {
  isConnected(state: StudentRoomState): boolean {
    if (!state.manager || !state.manager.WSClient) return false;
    return state.manager.WSClient.isConnected;
  },
  globalAudios(state: StudentRoomState): Array<string> {
    return state.globalAudios;
  },
  error(state: StudentRoomState): GLError | null {
    return state.error;
  },
  apiStatus(state: StudentRoomState): GLApiStatus | null {
    return state.apiStatus;
  },
  info(state: StudentRoomState): RoomModel {
    return state.info as RoomModel;
  },
  classInfo(state: StudentRoomState): ClassRoomModel {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return state.info?.classInfo!;
  },
  classes(state: StudentRoomState): Array<ClassModel> {
    return state.classes;
  },
  students(state: StudentRoomState): Array<StudentState> {
    return state.students;
  },
  teacher(state: StudentRoomState): TeacherState {
    return state.teacher as TeacherState;
  },
  student(state: StudentRoomState): StudentState {
    return state.student as StudentState;
  },
  roomManager(state: StudentRoomState): StudentRoomManager {
    return state.manager as StudentRoomManager;
  },
  classView(state: StudentRoomState): ClassView {
    return state.classView;
  },
  isLessonPlan(state: StudentRoomState) {
    return state.classView === ClassView.LESSON_PLAN;
  },
  isGalleryView(state: StudentRoomState) {
    return state.classView === ClassView.GALLERY;
  },
  isAllVideoHidden(state: StudentRoomState) {
    for (const student of state.students) {
      if (student.videoEnabled) return false;
    }
    return true;
  },
  isAllAudioMuted(state: StudentRoomState) {
    for (const student of state.students) {
      if (student.audioEnabled) return false;
    }
    return true;
  },
  isAllPaletteHidden(state: StudentRoomState) {
    for (const student of state.students) {
      if (student.isPalette) return false;
    }
    return true;
  },
  classAction(state: StudentRoomState): ClassAction {
    return state.classAction;
  },
  getStudentModeOneId(state: StudentRoomState): string {
    return state.idOne;
  },
  speakingUsers(state: StudentRoomState): Array<string> {
    return state.speakingUsers;
  },
  isShowWhiteboard(state: StudentRoomState): boolean {
    return state.showWhiteBoard;
  },
  laserPath(state: StudentRoomState): any {
    return state.laserPath;
  },
  isDisconnected(state: StudentRoomState): boolean {
    return state.isDisconnected;
  },
  isJoined(state: StudentRoomState): boolean {
    return state.isJoined;
  },
  teacherIsDisconnected(state: StudentRoomState): boolean {
    return state.teacherIsDisconnected;
  },
  getAvatarStudentOneToOne(state: StudentRoomState): string {
    return state.avatarStudentOneToOne;
  },
  videosFeedVisible(state: StudentRoomState): boolean {
    return state.videosFeedVisible;
  },
  user(state: StudentRoomState): UserModel | undefined {
    return state.user;
  },
  browserFingerPrint(state: StudentRoomState): string {
    return state.browserFingerPrinting;
  },
  isCaptureImage(state: StudentRoomState): boolean {
    return state.startCaptureImage;
  },
  getMediaState(state: StudentRoomState): boolean {
    return state.mediaState;
  },
  getCurrentTimeMedia(state: StudentRoomState): number {
    return state.currentTimeMedia;
  },
  helperInfo(state: StudentRoomState): HelperState | undefined {
    return state.helper;
  },
  helperVideoStatus(state: StudentRoomState): boolean {
    return state.helper?.isVideoShownByTeacher ?? false;
  },
};

export default getters;

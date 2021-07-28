import { createStore } from "vuex";
import AppModule from "./app";
import AuthModule from "./auth";
import SpinModule from "./spin";
import NotificationModule from "./notification";
import ParentModule from "./parent";
import TeacherModule from "./teacher";
import TeacherRoomModule from "./room/teacher";
import StudentRoomModule from "./room/student";
import LessonModule from "./lesson";
import InteractiveModule from "./interactive";
import AnnotationModule from "./annotation";
import AgoraModule from "./agora";

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    app: AppModule,
    auth: AuthModule,
    spin: SpinModule,
    parent: ParentModule,
    teacher: TeacherModule,
    teacherRoom: TeacherRoomModule,
    studentRoom: StudentRoomModule,
    lesson: LessonModule,
    notification: NotificationModule,
    interactive: InteractiveModule,
    annotation: AnnotationModule,
    agora: AgoraModule,
  },
});

export {
  store,
  AppModule,
  AuthModule,
  SpinModule,
  ParentModule,
  TeacherModule,
  TeacherRoomModule,
  StudentRoomModule,
  LessonModule,
  NotificationModule,
  InteractiveModule,
  AnnotationModule,
  AgoraModule,
};

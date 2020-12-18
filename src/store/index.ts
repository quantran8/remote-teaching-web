import { createStore } from "vuex";
import AppModule from "./app";
import AuthModule from "./auth";
import SpinModule from "./spin";
import ParentModule from "./parent";
import TeacherModule from "./teacher";
import TeacherRoomModule from "./room/teacher";
import StudentRoomModule from "./room/student";
import LessonModule from "./lesson";

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
};
